package com.secureflow.backend.controller;

import com.secureflow.backend.dto.*;
import com.secureflow.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DashboardAnalyticsService dashboardAnalyticsService;
    private final TransactionService transactionService;
    private final AccountService accountService;
    private final FraudRuleAdminService fraudRuleAdminService;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardOverviewDto> getDashboard() {
        return ResponseEntity.ok(dashboardAnalyticsService.getDashboardOverview());
    }

    @GetMapping("/transactions")
    public ResponseEntity<Page<TransactionDto>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(transactionService.getAllTransactions(pageRequest));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<AccountDto>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/fraud-rules")
    public ResponseEntity<List<FraudRuleDto>> getFraudRules() {
        return ResponseEntity.ok(fraudRuleAdminService.getAllRules());
    }

    @PutMapping("/fraud-rules/{id}")
    public ResponseEntity<FraudRuleDto> updateFraudRule(
            @PathVariable UUID id,
            @RequestBody FraudRuleDto dto,
            Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        return ResponseEntity.ok(fraudRuleAdminService.updateRule(id, dto, username));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(auditLogService.getAuditLogs(pageRequest));
    }
}
