package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FraudAlertDto {
    private String id;
    private String transactionId;
    private String referenceId;
    private BigDecimal transactionAmount;
    private String customerAccountNumber;
    private String customerName;
    private String category;
    private BigDecimal riskScore;
    private String severity;
    private String reason;
    private String status;
    private String investigatedByName;
    private String resolvedAt;
    private String createdAt;
    private List<InvestigationNoteDto> notes;
}
