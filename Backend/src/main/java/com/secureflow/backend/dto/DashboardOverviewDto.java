package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDto {
    private long totalTransactions;
    private long successfulTransactions;
    private long failedTransactions;
    private long flaggedTransactions;
    private long blockedTransactions;
    private BigDecimal totalTransactionVolume;
    private double fraudDetectionRate;
    private int highRiskAccounts;
    private List<TransactionDto> recentTransactions;
    private List<FraudAlertDto> recentAlerts;
    private List<Map<String, Object>> transactionsOverTime;
    private List<Map<String, Object>> riskDistribution;
    private List<Map<String, Object>> volumeByCategory;
    private List<Map<String, Object>> alertsBySeverity;
}
