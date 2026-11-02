package com.secureflow.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "account_type", nullable = false)
    private String accountType; // 'SAVINGS' or 'CURRENT'

    @Column(name = "balance", nullable = false)
    private BigDecimal balance;

    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "USD";

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE"; // 'ACTIVE', 'BLOCKED', 'CLOSED'

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
