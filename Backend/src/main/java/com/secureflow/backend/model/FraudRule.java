package com.secureflow.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fraud_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "rule_code", length = 50)
    private String ruleCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "risk_points", nullable = false)
    private BigDecimal riskPoints;

    @Column(name = "threshold")
    private BigDecimal threshold;

    @Column(name = "time_window_seconds")
    @Builder.Default
    private Integer timeWindowSeconds = 0;

    @Column(name = "action")
    @Builder.Default
    private String action = "FLAG"; // 'FLAG', 'HOLD', 'BLOCK'

    @Column(name = "enabled")
    @Builder.Default
    private Boolean enabled = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
