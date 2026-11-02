package com.secureflow.backend.service;

import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.model.Account;
import com.secureflow.backend.model.FraudRule;
import com.secureflow.backend.model.Transaction;
import com.secureflow.backend.model.TransactionDevice;
import com.secureflow.backend.repository.FraudRuleRepository;
import com.secureflow.backend.repository.TransactionDeviceRepository;
import com.secureflow.backend.repository.TransactionRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FraudDetectionEngine {

    private final FraudRuleRepository fraudRuleRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionDeviceRepository transactionDeviceRepository;

    @Data
    @Builder
    public static class FraudEvaluationResult {
        private BigDecimal riskScore;
        private String riskLevel; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
        private String action;    // 'APPROVE', 'FLAG', 'BLOCK'
        private String primaryCategory;
        private List<String> triggeredRules;
        private String explanation;
    }

    public FraudEvaluationResult evaluate(Account senderAccount, TransferRequestDto request) {
        BigDecimal totalScore = BigDecimal.ZERO;
        List<String> triggered = new ArrayList<>();
        StringBuilder explanation = new StringBuilder();
        String primaryCategory = "NORMAL";
        boolean mustBlock = false;

        // Fetch enabled rules or fallback to defaults
        Map<String, FraudRule> ruleMap = new HashMap<>();
        try {
            fraudRuleRepository.findByEnabledTrue().forEach(r -> ruleMap.put(r.getRuleCode(), r));
        } catch (Exception e) {
            log.warn("Could not query fraud rules from database, using built-in defaults: {}", e.getMessage());
        }

        BigDecimal amount = request.getAmount();

        // Rule 4: Insufficient Balance Check
        FraudRule r4 = ruleMap.get("RULE_INSUFFICIENT_BALANCE");
        if (r4 == null || Boolean.TRUE.equals(r4.getEnabled())) {
            BigDecimal points = r4 != null ? r4.getRiskPoints() : BigDecimal.valueOf(30);
            if (senderAccount.getBalance().compareTo(amount) < 0) {
                totalScore = totalScore.add(points);
                mustBlock = true;
                triggered.add("RULE_INSUFFICIENT_BALANCE");
                primaryCategory = "INSUFFICIENT_FUNDS";
                explanation.append("Requested transfer of $").append(amount)
                        .append(" exceeds available liquidity ($").append(senderAccount.getBalance()).append("). ");
            }
        }

        // Rule 1: Large Amount Check
        FraudRule r1 = ruleMap.get("RULE_LARGE_AMOUNT");
        if (r1 == null || Boolean.TRUE.equals(r1.getEnabled())) {
            BigDecimal threshold = r1 != null && r1.getThreshold() != null ? r1.getThreshold() : BigDecimal.valueOf(10000);
            BigDecimal points = r1 != null ? r1.getRiskPoints() : BigDecimal.valueOf(25);
            if (amount.compareTo(threshold) >= 0) {
                totalScore = totalScore.add(points);
                triggered.add("RULE_LARGE_AMOUNT");
                if ("NORMAL".equals(primaryCategory)) primaryCategory = "LARGE_AMOUNT_SPIKE";
                explanation.append("Transfer amount $").append(amount)
                        .append(" breaches large transaction limit ($").append(threshold).append("). ");
            }
        }

        // Rule 7: Structuring / Smurfing Pattern ($8,500 - $9,999)
        FraudRule r7 = ruleMap.get("RULE_STRUCTURING");
        if (r7 == null || Boolean.TRUE.equals(r7.getEnabled())) {
            BigDecimal minThresh = r7 != null && r7.getThreshold() != null ? r7.getThreshold() : BigDecimal.valueOf(8500);
            BigDecimal maxThresh = BigDecimal.valueOf(10000);
            BigDecimal points = r7 != null ? r7.getRiskPoints() : BigDecimal.valueOf(20);
            if (amount.compareTo(minThresh) >= 0 && amount.compareTo(maxThresh) < 0) {
                totalScore = totalScore.add(points);
                triggered.add("RULE_STRUCTURING");
                if ("NORMAL".equals(primaryCategory)) primaryCategory = "STRUCTURING";
                explanation.append("Transfer amount $").append(amount)
                        .append(" matches regulatory structuring/smurfing pattern ($8,500 - $9,999). ");
            }
        }

        // Rule 2: Rapid Transaction Burst (3+ in 120s)
        FraudRule r2 = ruleMap.get("RULE_RAPID_TXN");
        if (r2 == null || Boolean.TRUE.equals(r2.getEnabled())) {
            int window = r2 != null && r2.getTimeWindowSeconds() != null && r2.getTimeWindowSeconds() > 0 ? r2.getTimeWindowSeconds() : 120;
            long count = transactionRepository.countBySenderAccountIdAndCreatedAtAfter(
                    senderAccount.getId(), Instant.now().minus(Duration.ofSeconds(window)));
            long limit = r2 != null && r2.getThreshold() != null ? r2.getThreshold().longValue() : 3L;
            if (count >= limit) {
                BigDecimal points = r2 != null ? r2.getRiskPoints() : BigDecimal.valueOf(20);
                totalScore = totalScore.add(points);
                triggered.add("RULE_RAPID_TXN");
                if ("NORMAL".equals(primaryCategory)) primaryCategory = "VELOCITY_BURST";
                explanation.append("Rapid burst detected: ").append(count)
                        .append(" transactions in the last ").append(window).append("s. ");
            }
        }

        // Rule 3: Unusual Frequency (5+ in 1 hour)
        FraudRule r3 = ruleMap.get("RULE_UNUSUAL_FREQ");
        if (r3 == null || Boolean.TRUE.equals(r3.getEnabled())) {
            int window = r3 != null && r3.getTimeWindowSeconds() != null && r3.getTimeWindowSeconds() > 0 ? r3.getTimeWindowSeconds() : 3600;
            long count = transactionRepository.countBySenderAccountIdAndCreatedAtAfter(
                    senderAccount.getId(), Instant.now().minus(Duration.ofSeconds(window)));
            long limit = r3 != null && r3.getThreshold() != null ? r3.getThreshold().longValue() : 5L;
            if (count >= limit) {
                BigDecimal points = r3 != null ? r3.getRiskPoints() : BigDecimal.valueOf(15);
                totalScore = totalScore.add(points);
                triggered.add("RULE_UNUSUAL_FREQ");
                if ("NORMAL".equals(primaryCategory)) primaryCategory = "UNUSUAL_FREQUENCY";
                explanation.append("High hourly activity: ").append(count)
                        .append(" transactions in the last hour. ");
            }
        }

        // Rule 6: Repeated Failed Attempts (3+ failed in 300s)
        FraudRule r6 = ruleMap.get("RULE_REPEAT_FAIL");
        if (r6 == null || Boolean.TRUE.equals(r6.getEnabled())) {
            int window = r6 != null && r6.getTimeWindowSeconds() != null && r6.getTimeWindowSeconds() > 0 ? r6.getTimeWindowSeconds() : 300;
            long failCount = transactionRepository.countBySenderAccountIdAndStatusAndCreatedAtAfter(
                    senderAccount.getId(), "FAILED", Instant.now().minus(Duration.ofSeconds(window)));
            long limit = r6 != null && r6.getThreshold() != null ? r6.getThreshold().longValue() : 3L;
            if (failCount >= limit) {
                BigDecimal points = r6 != null ? r6.getRiskPoints() : BigDecimal.valueOf(15);
                totalScore = totalScore.add(points);
                triggered.add("RULE_REPEAT_FAIL");
                if ("NORMAL".equals(primaryCategory)) primaryCategory = "REPEAT_FAILURES";
                explanation.append("Repeated failed attempts: ").append(failCount)
                        .append(" failures in last ").append(window).append("s. ");
            }
        }

        // Rule 5: Impossible Geolocation Travel Velocity (Haversine formula > 800 km/h)
        FraudRule r5 = ruleMap.get("RULE_GEO_VELOCITY");
        if (r5 == null || Boolean.TRUE.equals(r5.getEnabled())) {
            if (request.getLatitude() != null && request.getLongitude() != null) {
                Optional<Transaction> lastTxnOpt = transactionRepository.findFirstBySenderAccountIdOrderByCreatedAtDesc(senderAccount.getId());
                if (lastTxnOpt.isPresent()) {
                    Transaction lastTxn = lastTxnOpt.get();
                    if (lastTxn.getLocation() != null && lastTxn.getCreatedAt() != null) {
                        double[] prevCoords = resolveLocationCoordinates(lastTxn.getLocation());
                        if (prevCoords != null) {
                            double distanceKm = haversineDistance(prevCoords[0], prevCoords[1], request.getLatitude(), request.getLongitude());
                            long secondsDiff = Math.max(1, Duration.between(lastTxn.getCreatedAt(), Instant.now()).getSeconds());
                            double hoursDiff = (double) secondsDiff / 3600.0;
                            double speedKmH = distanceKm / hoursDiff;
                            double maxAllowedSpeed = r5 != null && r5.getThreshold() != null ? r5.getThreshold().doubleValue() : 800.0;

                            if (distanceKm > 300 && speedKmH > maxAllowedSpeed) {
                                BigDecimal points = r5 != null ? r5.getRiskPoints() : BigDecimal.valueOf(25);
                                totalScore = totalScore.add(points);
                                triggered.add("RULE_GEO_VELOCITY");
                                if ("NORMAL".equals(primaryCategory)) primaryCategory = "IMPOSSIBLE_TRAVEL_VELOCITY";
                                explanation.append(String.format("Impossible travel velocity: %.0f km travelled in %.1f minutes (speed: %.0f km/h > %.0f km/h threshold). ",
                                        distanceKm, (double) secondsDiff / 60.0, speedKmH, maxAllowedSpeed));
                            }
                        }
                    }
                }
            }
        }

        // Unfamiliar Device check
        if (request.getDeviceFingerprint() != null) {
            Optional<TransactionDevice> knownDevice = transactionDeviceRepository.findByAccountIdAndDeviceFingerprint(
                    senderAccount.getId(), request.getDeviceFingerprint());
            if (knownDevice.isEmpty()) {
                totalScore = totalScore.add(BigDecimal.valueOf(15));
                triggered.add("RULE_UNFAMILIAR_DEVICE");
                explanation.append("Transaction initiated from previously unseen device (").append(request.getDeviceFingerprint()).append("). ");
            }
        }

        // Cap score at 100
        if (totalScore.compareTo(BigDecimal.valueOf(100)) > 0) {
            totalScore = BigDecimal.valueOf(100);
        }

        // Determine Risk Level and Action
        String riskLevel;
        String action;

        if (mustBlock || totalScore.compareTo(BigDecimal.valueOf(80)) >= 0) {
            riskLevel = "CRITICAL";
            action = "BLOCK";
        } else if (totalScore.compareTo(BigDecimal.valueOf(60)) >= 0) {
            riskLevel = "HIGH";
            action = "FLAG";
        } else if (totalScore.compareTo(BigDecimal.valueOf(30)) >= 0) {
            riskLevel = "MEDIUM";
            action = "APPROVE";
        } else {
            riskLevel = "LOW";
            action = "APPROVE";
        }

        if (explanation.length() == 0) {
            explanation.append("Transaction screened normal by heuristic rules. Risk low.");
        }

        return FraudEvaluationResult.builder()
                .riskScore(totalScore)
                .riskLevel(riskLevel)
                .action(action)
                .primaryCategory(primaryCategory)
                .triggeredRules(triggered)
                .explanation(explanation.toString().trim())
                .build();
    }

    public static double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private double[] resolveLocationCoordinates(String locationName) {
        if (locationName == null) return null;
        String loc = locationName.toLowerCase();
        if (loc.contains("new york")) return new double[]{40.7128, -74.0060};
        if (loc.contains("london")) return new double[]{51.5074, -0.1278};
        if (loc.contains("tokyo")) return new double[]{35.6762, 139.6503};
        if (loc.contains("singapore")) return new double[]{1.3521, 103.8198};
        if (loc.contains("lagos")) return new double[]{6.5244, 3.3792};
        if (loc.contains("zurich")) return new double[]{47.3769, 8.5417};
        return null;
    }
}
