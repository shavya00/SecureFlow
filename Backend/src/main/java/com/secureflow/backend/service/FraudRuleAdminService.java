package com.secureflow.backend.service;

import com.secureflow.backend.dto.FraudRuleDto;
import com.secureflow.backend.model.FraudRule;
import com.secureflow.backend.repository.FraudRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudRuleAdminService {

    private final FraudRuleRepository fraudRuleRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<FraudRuleDto> getAllRules() {
        return fraudRuleRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FraudRuleDto updateRule(UUID id, FraudRuleDto dto, String adminUsername) {
        FraudRule rule = fraudRuleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fraud rule not found: " + id));

        if (dto.getWeightScore() != null) {
            rule.setRiskPoints(dto.getWeightScore());
        }
        if (dto.getThresholdValue() != null && !dto.getThresholdValue().isEmpty()) {
            try {
                rule.setThreshold(new BigDecimal(dto.getThresholdValue().replaceAll("[^0-9.]", "")));
            } catch (Exception ignored) {}
        }
        if (dto.getTimeWindowSeconds() != null) {
            rule.setTimeWindowSeconds(dto.getTimeWindowSeconds());
        }
        if (dto.getAction() != null) {
            rule.setAction(dto.getAction());
        }
        if (dto.getEnabled() != null) {
            rule.setEnabled(dto.getEnabled());
        }

        rule = fraudRuleRepository.save(rule);

        auditLogService.recordLog(
                null,
                "RULE_UPDATED",
                "FRAUD_RULE",
                rule.getId(),
                "{\"ruleCode\": \"" + rule.getRuleCode() + "\", \"enabled\": " + rule.getEnabled() + ", \"weight\": " + rule.getRiskPoints() + "}",
                "127.0.0.1"
        );

        return toDto(rule);
    }

    public FraudRuleDto toDto(FraudRule rule) {
        return FraudRuleDto.builder()
                .id(rule.getId() != null ? rule.getId().toString() : null)
                .ruleName(rule.getRuleName())
                .ruleCode(rule.getRuleCode())
                .description(rule.getDescription())
                .weightScore(rule.getRiskPoints())
                .thresholdValue(rule.getThreshold() != null ? String.valueOf(rule.getThreshold()) : "0")
                .timeWindowSeconds(rule.getTimeWindowSeconds() != null ? rule.getTimeWindowSeconds() : 0)
                .action(rule.getAction() != null ? rule.getAction() : "FLAG")
                .enabled(rule.getEnabled() != null ? rule.getEnabled() : true)
                .build();
    }
}
