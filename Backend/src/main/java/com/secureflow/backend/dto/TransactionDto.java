package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDto {
    private String id;
    private String referenceId;
    private String sourceAccountNumber;
    private String destinationAccountNumber;
    private String sourceOwnerName;
    private String destinationOwnerName;
    private BigDecimal amount;
    private String currency;
    private String type;
    private String status;
    private BigDecimal riskScore;
    private String riskLevel;
    private String description;
    private String location;
    private String ipAddress;
    private String idempotencyKey;
    private String failureReason;
    private String createdAt;
}
