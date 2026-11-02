package com.secureflow.backend;

import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.model.Account;
import com.secureflow.backend.service.FraudDetectionEngine;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudDetectionEngineTest {

    @Autowired
    private FraudDetectionEngine fraudDetectionEngine;

    @Test
    void testLargeAmountBreachRule() {
        Account sender = Account.builder()
                .balance(BigDecimal.valueOf(50000.00))
                .build();

        TransferRequestDto req = TransferRequestDto.builder()
                .amount(BigDecimal.valueOf(15000.00))
                .build();

        FraudDetectionEngine.FraudEvaluationResult result = fraudDetectionEngine.evaluate(sender, req);
        assertNotNull(result);
        assertTrue(result.getTriggeredRules().contains("RULE_LARGE_AMOUNT"));
        assertTrue(result.getRiskScore().compareTo(BigDecimal.valueOf(25)) >= 0);
        System.out.println("Large amount rule passed: score=" + result.getRiskScore());
    }

    @Test
    void testStructuringRule() {
        Account sender = Account.builder()
                .balance(BigDecimal.valueOf(50000.00))
                .build();

        TransferRequestDto req = TransferRequestDto.builder()
                .amount(BigDecimal.valueOf(9200.00))
                .build();

        FraudDetectionEngine.FraudEvaluationResult result = fraudDetectionEngine.evaluate(sender, req);
        assertNotNull(result);
        assertTrue(result.getTriggeredRules().contains("RULE_STRUCTURING"));
        assertTrue(result.getRiskScore().compareTo(BigDecimal.valueOf(20)) >= 0);
        System.out.println("Structuring rule passed: score=" + result.getRiskScore());
    }

    @Test
    void testInsufficientBalanceRule() {
        Account sender = Account.builder()
                .balance(BigDecimal.valueOf(100.00))
                .build();

        TransferRequestDto req = TransferRequestDto.builder()
                .amount(BigDecimal.valueOf(500.00))
                .build();

        FraudDetectionEngine.FraudEvaluationResult result = fraudDetectionEngine.evaluate(sender, req);
        assertNotNull(result);
        assertTrue(result.getTriggeredRules().contains("RULE_INSUFFICIENT_BALANCE"));
        assertEquals("BLOCK", result.getAction());
        assertEquals("CRITICAL", result.getRiskLevel());
        System.out.println("Insufficient balance rule passed: action=" + result.getAction());
    }

    @Test
    void testHaversineDistanceCalculation() {
        // Distance between New York (40.7128, -74.0060) and London (51.5074, -0.1278) ~ 5570 km
        double dist = FraudDetectionEngine.haversineDistance(40.7128, -74.0060, 51.5074, -0.1278);
        assertTrue(dist > 5500 && dist < 5600, "Haversine distance should be ~5,570 km, got: " + dist);
        System.out.println("Haversine distance verified: " + dist + " km");
    }
}
