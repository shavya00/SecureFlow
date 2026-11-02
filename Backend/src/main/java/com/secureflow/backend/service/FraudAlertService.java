package com.secureflow.backend.service;

import com.secureflow.backend.dto.FraudAlertDto;
import com.secureflow.backend.dto.InvestigationNoteDto;
import com.secureflow.backend.model.FraudAlert;
import com.secureflow.backend.model.InvestigationNote;
import com.secureflow.backend.model.User;
import com.secureflow.backend.repository.FraudAlertRepository;
import com.secureflow.backend.repository.InvestigationNoteRepository;
import com.secureflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;
    private final InvestigationNoteRepository investigationNoteRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<FraudAlertDto> getAlerts(Pageable pageable) {
        return fraudAlertRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public FraudAlertDto getAlertById(UUID id) {
        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud alert not found with ID: " + id));
        return toDto(alert);
    }

    @Transactional
    public FraudAlertDto markInvestigating(UUID id, String note, String investigatorUsername) {
        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud alert not found with ID: " + id));

        alert.setInvestigationStatus("INVESTIGATING");
        fraudAlertRepository.save(alert);

        User investigator = userRepository.findByUsername(investigatorUsername).orElse(null);
        UUID investigatorId = investigator != null ? investigator.getId() : null;

        if (note != null && !note.trim().isEmpty()) {
            InvestigationNote n = InvestigationNote.builder()
                    .fraudAlert(alert)
                    .investigatorId(investigatorId)
                    .note(note.trim())
                    .build();
            investigationNoteRepository.save(n);
        }

        auditLogService.recordLog(
                investigatorId,
                "ALERT_INVESTIGATING",
                "FRAUD_ALERT",
                alert.getId(),
                "{\"status\": \"INVESTIGATING\", \"note\": \"" + (note != null ? note.replace("\"", "\\\"") : "") + "\"}",
                "127.0.0.1"
        );

        return toDto(alert);
    }

    @Transactional
    public FraudAlertDto resolveAlert(UUID id, String status, String note, String investigatorUsername) {
        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud alert not found with ID: " + id));

        // Allowed statuses: 'OPEN', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'
        String upperStatus = status != null ? status.toUpperCase() : "RESOLVED";
        alert.setInvestigationStatus(upperStatus);
        fraudAlertRepository.save(alert);

        User investigator = userRepository.findByUsername(investigatorUsername).orElse(null);
        UUID investigatorId = investigator != null ? investigator.getId() : null;

        if (note != null && !note.trim().isEmpty()) {
            InvestigationNote n = InvestigationNote.builder()
                    .fraudAlert(alert)
                    .investigatorId(investigatorId)
                    .note(note.trim())
                    .build();
            investigationNoteRepository.save(n);
        }

        auditLogService.recordLog(
                investigatorId,
                "ALERT_RESOLVED",
                "FRAUD_ALERT",
                alert.getId(),
                "{\"resolution\": \"" + upperStatus + "\", \"note\": \"" + (note != null ? note.replace("\"", "\\\"") : "") + "\"}",
                "127.0.0.1"
        );

        return toDto(alert);
    }

    @Transactional
    public FraudAlertDto addNote(UUID id, String note, String investigatorUsername) {
        FraudAlert alert = fraudAlertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud alert not found with ID: " + id));

        User investigator = userRepository.findByUsername(investigatorUsername).orElse(null);
        UUID investigatorId = investigator != null ? investigator.getId() : null;

        InvestigationNote n = InvestigationNote.builder()
                .fraudAlert(alert)
                .investigatorId(investigatorId)
                .note(note.trim())
                .build();
        investigationNoteRepository.save(n);

        auditLogService.recordLog(
                investigatorId,
                "ALERT_NOTE_ADDED",
                "FRAUD_ALERT",
                alert.getId(),
                "{\"note\": \"" + note.replace("\"", "\\\"") + "\"}",
                "127.0.0.1"
        );

        return toDto(alert);
    }

    public FraudAlertDto toDto(FraudAlert alert) {
        String refId = alert.getTransaction() != null ? alert.getTransaction().getReferenceId() : null;
        var txn = alert.getTransaction();

        String senderAccNum = txn != null && txn.getSenderAccount() != null ? txn.getSenderAccount().getAccountNumber() : "UNKNOWN";
        String customerName = txn != null && txn.getSenderAccount() != null && txn.getSenderAccount().getCustomer() != null
                ? txn.getSenderAccount().getCustomer().getFullName() : "Unknown Customer";

        List<InvestigationNote> notesList = investigationNoteRepository.findByFraudAlertIdOrderByCreatedAtDesc(alert.getId());
        List<InvestigationNoteDto> noteDtos = notesList.stream()
                .map(n -> {
                    String author = "Investigator";
                    if (n.getInvestigatorId() != null) {
                        author = userRepository.findById(n.getInvestigatorId())
                                .map(User::getFullName)
                                .orElse("Investigator");
                    }
                    return InvestigationNoteDto.builder()
                            .id(n.getId() != null ? n.getId().toString() : null)
                            .authorName(author)
                            .note(n.getNote())
                            .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return FraudAlertDto.builder()
                .id(alert.getId() != null ? alert.getId().toString() : null)
                .transactionId(txn != null && txn.getId() != null ? txn.getId().toString() : null)
                .referenceId(refId)
                .transactionAmount(txn != null ? txn.getAmount() : null)
                .customerAccountNumber(senderAccNum)
                .customerName(customerName)
                .category(alert.getFraudCategory() != null ? alert.getFraudCategory() : "GENERAL")
                .riskScore(alert.getRiskScore())
                .severity(alert.getSeverity())
                .reason(alert.getExplanation())
                .status(alert.getInvestigationStatus() != null ? alert.getInvestigationStatus() : "OPEN")
                .createdAt(alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : null)
                .notes(noteDtos)
                .build();
    }
}
