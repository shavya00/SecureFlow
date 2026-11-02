package com.secureflow.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "fraud_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(name = "risk_score", nullable = false)
    private BigDecimal riskScore;

    @Column(name = "severity", nullable = false)
    private String severity; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

    @Column(name = "fraud_category")
    private String fraudCategory;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "investigation_status")
    @Builder.Default
    private String investigationStatus = "OPEN"; // 'OPEN', 'INVESTIGATING', 'CONFIRMED_FRAUD', 'FALSE_POSITIVE', 'RESOLVED'

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "fraudAlert", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<InvestigationNote> notes = new ArrayList<>();
}
