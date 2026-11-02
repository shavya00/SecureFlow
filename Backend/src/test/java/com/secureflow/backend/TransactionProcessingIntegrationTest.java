package com.secureflow.backend;

import com.secureflow.backend.dto.TransactionDto;
import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.model.Account;
import com.secureflow.backend.model.LedgerEntry;
import com.secureflow.backend.repository.AccountRepository;
import com.secureflow.backend.repository.LedgerEntryRepository;
import com.secureflow.backend.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransactionProcessingIntegrationTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private LedgerEntryRepository ledgerEntryRepository;

    @Test
    void testAtomicTransferAndDoubleEntryLedger() {
        String sourceAcc = "SENT-4827-001";
        String destAcc = "SENT-2613-003";

        Account senderBefore = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        Account receiverBefore = accountRepository.findByAccountNumber(destAcc).orElseThrow();

        BigDecimal amount = BigDecimal.valueOf(100.00);
        String idempKey = "test-atomic-" + UUID.randomUUID();

        TransferRequestDto req = TransferRequestDto.builder()
                .sourceAccountNumber(sourceAcc)
                .destinationAccountNumber(destAcc)
                .amount(amount)
                .description("Test Automated Transfer")
                .idempotencyKey(idempKey)
                .build();

        TransactionDto txn = transactionService.processTransfer(req, "customer");
        assertNotNull(txn);
        assertEquals("COMPLETED", txn.getStatus());

        // Verify Balances
        Account senderAfter = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        Account receiverAfter = accountRepository.findByAccountNumber(destAcc).orElseThrow();

        assertEquals(0, senderBefore.getBalance().subtract(amount).compareTo(senderAfter.getBalance()));
        assertEquals(0, receiverBefore.getBalance().add(amount).compareTo(receiverAfter.getBalance()));

        // Verify Double-Entry Ledger Invariant: sum(DEBIT) == sum(CREDIT)
        List<LedgerEntry> entries = ledgerEntryRepository.findByTransactionId(UUID.fromString(txn.getId()));
        assertEquals(2, entries.size(), "Each transfer must produce exactly 2 ledger entries");

        BigDecimal totalDebit = entries.stream()
                .filter(e -> "DEBIT".equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredit = entries.stream()
                .filter(e -> "CREDIT".equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(0, totalDebit.compareTo(totalCredit), "Double-entry invariant failed: sum(DEBIT) != sum(CREDIT)");
        assertEquals(0, amount.compareTo(totalDebit));

        System.out.println("Atomic transfer and double-entry ledger verified! Debit: $" + totalDebit + " == Credit: $" + totalCredit);

        // Test Idempotency: repeating same request returns same transaction without double debit
        TransactionDto duplicateResult = transactionService.processTransfer(req, "customer");
        assertEquals(txn.getId(), duplicateResult.getId());
        assertEquals(txn.getReferenceId(), duplicateResult.getReferenceId());

        Account senderAfterDuplicate = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        assertEquals(0, senderAfter.getBalance().compareTo(senderAfterDuplicate.getBalance()), "Duplicate transfer must NOT debit again");
        System.out.println("Idempotency key duplicate submission protection verified!");

        // Test Compensating Reversal
        TransactionDto reversedTxn = transactionService.reverseTransaction(UUID.fromString(txn.getId()), "Automated test rollback", "admin");
        assertEquals("REVERSED", reversedTxn.getStatus());

        Account senderAfterReversal = accountRepository.findByAccountNumber(sourceAcc).orElseThrow();
        Account receiverAfterReversal = accountRepository.findByAccountNumber(destAcc).orElseThrow();

        assertEquals(0, senderBefore.getBalance().compareTo(senderAfterReversal.getBalance()), "Sender balance must be restored on reversal");
        assertEquals(0, receiverBefore.getBalance().compareTo(receiverAfterReversal.getBalance()), "Receiver balance must be restored on reversal");

        System.out.println("Compensating reversal verified! Balances restored: $" + senderAfterReversal.getBalance());
    }

    @Test
    void testInsufficientBalanceRejection() {
        String sourceAcc = "SENT-4827-001";
        String destAcc = "SENT-2613-003";

        TransferRequestDto req = TransferRequestDto.builder()
                .sourceAccountNumber(sourceAcc)
                .destinationAccountNumber(destAcc)
                .amount(BigDecimal.valueOf(999999999.00)) // Outrageously high amount
                .description("Overdraft Attempt")
                .idempotencyKey("test-overdraft-" + UUID.randomUUID())
                .build();

        TransactionDto txn = transactionService.processTransfer(req, "customer");
        assertNotNull(txn);
        assertEquals("BLOCKED", txn.getStatus());
        assertTrue(txn.getFailureReason().contains("exceeds available liquidity"));
        System.out.println("Insufficient balance rejection verified: status=" + txn.getStatus() + ", reason=" + txn.getFailureReason());
    }
}
