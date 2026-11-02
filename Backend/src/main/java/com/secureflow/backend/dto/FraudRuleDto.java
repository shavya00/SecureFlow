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
public class FraudRuleDto {
    private String id;
    private String ruleName;
    private String ruleCode;
    private String description;
    private BigDecimal weightScore;
    private String thresholdValue;
    private Integer timeWindowSeconds;
    private String action;
    private Boolean enabled;
}
