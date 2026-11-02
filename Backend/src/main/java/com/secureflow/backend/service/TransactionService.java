package com.secureflow.backend.service;

import com.secureflow.backend.dto.TransactionDto;
import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.model.*;
import com.secureflow.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final TransactionDeviceRepository transactionDeviceRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final FraudDetectionEngine fraudDetectionEngine;
    private final AuditLogService auditLogService;

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public TransactionDto processTransfer(TransferRequestDto request, String username) {
        String idempKey = request.getIdempotencyKey();

        // 1. Idempotency Check
        if (idempKey != null && !idempKey.trim().isEmpty()) {
            Optional<IdempotencyKey> existingKeyOpt = idempotencyKeyRepository.findByIdempotencyKey(idempKey.trim());
            if (existingKeyOpt.isPresent()) {
                IdempotencyKey keyObj = existingKeyOpt.get();
                if (keyObj.getTransaction() != null) {
                    log.info("Idempotent request received with key: {}. Returning cached transaction.", idempKey);
                    return toDto(keyObj.getTransaction());
                }
            }
        }

        // 2. Validate source and destination account numbers
        if (request.getSourceAccountNumber().equalsIgnoreCase(request.getDestinationAccountNumber())) {
            throw new IllegalArgumentException("Source and destination accounts must be distinct.");
        }

        Account senderUnsafe = accountRepository.findByAccountNumber(request.getSourceAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Source account not found: " + request.getSourceAccountNumber()));

        Account receiverUnsafe = accountRepository.findByAccountNumber(request.getDestinationAccountNumber())
                .orElseThrow(() -> new IllegalArgumentException("Destination account not found: " + request.getDestinationAccountNumber()));

        // 3. Deadlock-free pessimistic locking in sorted UUID order
        UUID id1 = senderUnsafe.getId();
        UUID id2 = receiverUnsafe.getId();
        Account lockedSender;
        Account lockedReceiver;

        if (id1.compareTo(id2) < 0) {
            Account first = accountRepository.findByIdWithLock(id1).orElseThrow();
            Account second = accountRepository.findByIdWithLock(id2).orElseThrow();
            lockedSender = first;
            lockedReceiver = second;
        } else {
            Account first = accountRepository.findByIdWithLock(id2).orElseThrow();
            Account second = accountRepository.findByIdWithLock(id1).orElseThrow();
            lockedSender = second;
            lockedReceiver = first;
        }

        // 4. Verify Account Status
        if (!"ACTIVE".equalsIgnoreCase(lockedSender.getStatus())) {
            throw new IllegalStateException("Source account is " + lockedSender.getStatus() + " and cannot execute transfers.");
        }
        if (!"ACTIVE".equalsIgnoreCase(lockedReceiver.getStatus())) {
            throw new IllegalStateException("Destination account is " + lockedReceiver.getStatus() + ".");
        }

        BigDecimal transferAmount = request.getAmount();

        // 5. Run Fraud Detection Engine
        FraudDetectionEngine.FraudEvaluationResult fraudResult = fraudDetectionEngine.evaluate(lockedSender, request);
        log.info("Fraud evaluation: score={}, level={}, action={}, category={}",
                fraudResult.getRiskScore(), fraudResult.getRiskLevel(), fraudResult.getAction(), fraudResult.getPrimaryCategory());

        String referenceId = "TXN-" + (10000 + new Random().nextInt(90000));

        // 6. Branch on Risk Decision
        if ("BLOCK".equalsIgnoreCase(fraudResult.getAction())) {
            // Rejection / Blocked transaction: record attempt, DO NOT transfer funds
            Transaction blockedTxn = Transaction.builder()
                    .referenceId(referenceId)
                    .senderAccount(lockedSender)
                    .receiverAccount(lockedReceiver)
                    .amount(transferAmount)
                    .currency(lockedSender.getCurrency())
                    .transactionType("TRANSFER")
                    .status("BLOCKED")
                    .description(request.getDescription())
                    .riskScore(fraudResult.getRiskScore())
                    .failureReason(fraudResult.getExplanation())
                    .location(request.getLocation())
                    .ipAddress(request.getIpAddress())
                    .build();
            blockedTxn = transactionRepository.save(blockedTxn);

            // Create Critical Fraud Alert
            FraudAlert alert = FraudAlert.builder()
                    .transaction(blockedTxn)
                    .riskScore(fraudResult.getRiskScore())
                    .severity("CRITICAL")
                    .fraudCategory(fraudResult.getPrimaryCategory())
                    .explanation(fraudResult.getExplanation())
                    .investigationStatus("OPEN")
                    .build();
            fraudAlertRepository.save(alert);

            recordIdempotency(idempKey, blockedTxn);
            auditLogService.recordLog(null, "TRANSFER_BLOCKED", "TRANSACTION", blockedTxn.getId(),
                    "{\"amount\": " + transferAmount + ", \"riskScore\": " + fraudResult.getRiskScore() + "}", request.getIpAddress());

            return toDto(blockedTxn);
        }

        // Determine final transaction status (COMPLETED or FLAGGED)
        String finalStatus = "FLAG".equalsIgnoreCase(fraudResult.getAction()) ? "FLAGGED" : "COMPLETED";

        // 7. Atomic Balance Update
        lockedSender.setBalance(lockedSender.getBalance().subtract(transferAmount));
        lockedReceiver.setBalance(lockedReceiver.getBalance().add(transferAmount));
        accountRepository.save(lockedSender);
        accountRepository.save(lockedReceiver);

        // 8. Persist Transaction
        Transaction txn = Transaction.builder()
                .referenceId(referenceId)
                .senderAccount(lockedSender)
                .receiverAccount(lockedReceiver)
                .amount(transferAmount)
                .currency(lockedSender.getCurrency())
                .transactionType("TRANSFER")
                .status(finalStatus)
                .description(request.getDescription() != null ? request.getDescription() : "Direct Account Transfer")
                .riskScore(fraudResult.getRiskScore())
                .failureReason(finalStatus.equals("FLAGGED") ? fraudResult.getExplanation() : null)
                .location(request.getLocation())
                .ipAddress(request.getIpAddress())
                .build();
        txn = transactionRepository.save(txn);

        // 9. Balanced Double-Entry Accounting Ledger Invariant: sum(DEBIT) == sum(CREDIT)
        LedgerEntry debitSender = LedgerEntry.builder()
                .transaction(txn)
                .account(lockedSender)
                .entryType("DEBIT")
                .amount(transferAmount)
                .build();

        LedgerEntry creditReceiver = LedgerEntry.builder()
                .transaction(txn)
                .account(lockedReceiver)
                .entryType("CREDIT")
                .amount(transferAmount)
                .build();

        ledgerEntryRepository.save(debitSender);
        ledgerEntryRepository.save(creditReceiver);

        // 10. If Flagged, generate Fraud Alert for analyst triage
        if ("FLAGGED".equals(finalStatus)) {
            FraudAlert alert = FraudAlert.builder()
                    .transaction(txn)
                    .riskScore(fraudResult.getRiskScore())
                    .severity("HIGH")
                    .fraudCategory(fraudResult.getPrimaryCategory())
                    .explanation(fraudResult.getExplanation())
                    .investigationStatus("INVESTIGATING")
                    .build();
            fraudAlertRepository.save(alert);
        }

        // 11. Record Device Telemetry
        if (request.getDeviceFingerprint() != null && !request.getDeviceFingerprint().isEmpty()) {
            TransactionDevice device = transactionDeviceRepository.findByAccountIdAndDeviceFingerprint(
                    lockedSender.getId(), request.getDeviceFingerprint())
                    .orElse(TransactionDevice.builder()
                            .account(lockedSender)
                            .deviceFingerprint(request.getDeviceFingerprint())
                            .build());

            device.setIpAddress(request.getIpAddress());
            device.setLocation(request.getLocation());
            device.setLastSeen(Instant.now());
            transactionDeviceRepository.save(device);
        }

        // 12. Record Idempotency Key
        recordIdempotency(idempKey, txn);

        // 13. System Audit Log
        auditLogService.recordLog(null, "TRANSFER_SETTLED", "TRANSACTION", txn.getId(),
                "{\"amount\": " + transferAmount + ", \"status\": \"" + finalStatus + "\", \"ref\": \"" + referenceId + "\"}", request.getIpAddress());

        return toDto(txn);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public TransactionDto reverseTransaction(UUID transactionId, String reason, String actorUsername) {
        Transaction txn = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if ("REVERSED".equalsIgnoreCase(txn.getStatus())) {
            throw new IllegalStateException("Transaction has already been reversed.");
        }
        if (!"COMPLETED".equalsIgnoreCase(txn.getStatus()) && !"FLAGGED".equalsIgnoreCase(txn.getStatus())) {
            throw new IllegalStateException("Only COMPLETED or FLAGGED transactions can be reversed.");
        }

        Account senderUnsafe = txn.getSenderAccount();
        Account receiverUnsafe = txn.getReceiverAccount();
        if (senderUnsafe == null || receiverUnsafe == null) {
            throw new IllegalStateException("Cannot reverse transaction missing sender or receiver account.");
        }

        // Lock accounts in deterministic sorted order
        UUID id1 = senderUnsafe.getId();
        UUID id2 = receiverUnsafe.getId();
        Account lockedSender;
        Account lockedReceiver;

        if (id1.compareTo(id2) < 0) {
            lockedSender = accountRepository.findByIdWithLock(id1).orElseThrow();
            lockedReceiver = accountRepository.findByIdWithLock(id2).orElseThrow();
        } else {
            lockedReceiver = accountRepository.findByIdWithLock(id2).orElseThrow();
            lockedSender = accountRepository.findByIdWithLock(id1).orElseThrow();
        }

        BigDecimal amount = txn.getAmount();

        // Compensating Balance Restoration
        lockedReceiver.setBalance(lockedReceiver.getBalance().subtract(amount));
        lockedSender.setBalance(lockedSender.getBalance().add(amount));
        accountRepository.save(lockedReceiver);
        accountRepository.save(lockedSender);

        // Compensating Double-Entry Ledger Entries
        LedgerEntry reverseCreditSender = LedgerEntry.builder()
                .transaction(txn)
                .account(lockedSender)
                .entryType("CREDIT")
                .amount(amount)
                .build();

        LedgerEntry reverseDebitReceiver = LedgerEntry.builder()
                .transaction(txn)
                .account(lockedReceiver)
                .entryType("DEBIT")
                .amount(amount)
                .build();

        ledgerEntryRepository.save(reverseCreditSender);
        ledgerEntryRepository.save(reverseDebitReceiver);

        txn.setStatus("REVERSED");
        txn.setFailureReason("Reversed: " + reason);
        transactionRepository.save(txn);

        User actor = userRepository.findByUsername(actorUsername).orElse(null);
        auditLogService.recordLog(
                actor != null ? actor.getId() : null,
                "COMPENSATING_REVERSAL",
                "TRANSACTION",
                txn.getId(),
                "{\"amount\": " + amount + ", \"reason\": \"" + reason.replace("\"", "\\\"") + "\"}",
                "127.0.0.1"
        );

        return toDto(txn);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getTransactionsForUser(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && !"CUSTOMER".equalsIgnoreCase(user.getRole())) {
            return transactionRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
        }

        if (user != null) {
            Customer customer = customerRepository.findByAuthUserId(user.getId()).orElse(null);
            if (customer != null) {
                List<UUID> accountIds = accountRepository.findByCustomerId(customer.getId())
                        .stream().map(Account::getId).collect(Collectors.toList());
                if (!accountIds.isEmpty()) {
                    return transactionRepository.findByAccountIds(accountIds, pageable).map(this::toDto);
                }
            }
        }

        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<TransactionDto> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    private void recordIdempotency(String idempKey, Transaction txn) {
        if (idempKey != null && !idempKey.trim().isEmpty()) {
            try {
                IdempotencyKey keyObj = IdempotencyKey.builder()
                        .idempotencyKey(idempKey.trim())
                        .requestHash(hashKey(idempKey))
                        .transaction(txn)
                        .build();
                idempotencyKeyRepository.save(keyObj);
            } catch (Exception e) {
                log.warn("Could not record idempotency key {}: {}", idempKey, e.getMessage());
            }
        }
    }

    private String hashKey(String key) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(key.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    public TransactionDto toDto(Transaction t) {
        String sourceNum = t.getSenderAccount() != null ? t.getSenderAccount().getAccountNumber() : "External";
        String destNum = t.getReceiverAccount() != null ? t.getReceiverAccount().getAccountNumber() : "External";

        String sourceOwner = t.getSenderAccount() != null && t.getSenderAccount().getCustomer() != null
                ? t.getSenderAccount().getCustomer().getFullName() : "External Sender";
        String destOwner = t.getReceiverAccount() != null && t.getReceiverAccount().getCustomer() != null
                ? t.getReceiverAccount().getCustomer().getFullName() : "External Beneficiary";

        double score = t.getRiskScore() != null ? t.getRiskScore().doubleValue() : 0.0;
        String riskLevel = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";

        return TransactionDto.builder()
                .id(t.getId() != null ? t.getId().toString() : null)
                .referenceId(t.getReferenceId() != null ? t.getReferenceId() : "TXN-" + t.getId().toString().substring(0, 8))
                .sourceAccountNumber(sourceNum)
                .destinationAccountNumber(destNum)
                .sourceOwnerName(sourceOwner)
                .destinationOwnerName(destOwner)
                .amount(t.getAmount())
                .currency(t.getCurrency() != null ? t.getCurrency().trim() : "USD")
                .type(t.getTransactionType())
                .status(t.getStatus())
                .riskScore(t.getRiskScore() != null ? t.getRiskScore() : BigDecimal.ZERO)
                .riskLevel(riskLevel)
                .description(t.getDescription())
                .location(t.getLocation())
                .ipAddress(t.getIpAddress())
                .failureReason(t.getFailureReason())
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .build();
    }
}
