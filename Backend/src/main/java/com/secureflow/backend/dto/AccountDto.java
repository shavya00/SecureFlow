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
public class AccountDto {
    private String id;
    private String accountNumber;
    private String maskedAccountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private String status;
    private BigDecimal dailyLimit;
    private String ownerName;
    private String userId;
    private String createdAt;
}
