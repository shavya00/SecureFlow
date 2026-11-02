package com.secureflow.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reference_id", length = 64)
    private String referenceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_account_id")
    private Account senderAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_account_id")
    private Account receiverAccount;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "transaction_type", nullable = false)
    @Builder.Default
    private String transactionType = "TRANSFER"; // 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'REVERSAL'

    @Column(name = "status", nullable = false)
    private String status; // 'INITIATED', 'PENDING', 'APPROVED', 'COMPLETED', 'FLAGGED', 'BLOCKED', 'FAILED', 'REVERSED'

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "risk_score")
    @Builder.Default
    private BigDecimal riskScore = BigDecimal.ZERO;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "location")
    private String location;

    @Column(name = "ip_address")
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
