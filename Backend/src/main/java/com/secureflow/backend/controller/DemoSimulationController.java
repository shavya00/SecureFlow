package com.secureflow.backend.controller;

import com.secureflow.backend.dto.TransactionDto;
import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoSimulationController {

    private final TransactionService transactionService;

    @PostMapping("/trigger/{scenario}")
    public ResponseEntity<Map<String, Object>> triggerScenario(@PathVariable String scenario) {
        log.info("Triggering demo simulation scenario: {}", scenario);

        String sourceAcc = "SENT-4827-001";
        String destAcc = "SENT-2613-003";
        TransactionDto lastResult = null;

        switch (scenario.toLowerCase()) {
            case "large-amount": {
                TransferRequestDto req = TransferRequestDto.builder()
                        .sourceAccountNumber(sourceAcc)
                        .destinationAccountNumber(destAcc)
                        .amount(BigDecimal.valueOf(18500.00))
                        .description("Simulated High-Value Commercial Wire")
                        .location("New York, USA")
                        .latitude(40.7128)
                        .longitude(-74.0060)
                        .ipAddress("192.168.10.45")
                        .deviceFingerprint("dev-DemoSimulator")
                        .idempotencyKey("demo-large-" + System.currentTimeMillis())
                        .build();
                lastResult = transactionService.processTransfer(req, "customer");
                break;
            }
            case "rapid-burst": {
                for (int i = 1; i <= 3; i++) {
                    TransferRequestDto req = TransferRequestDto.builder()
                            .sourceAccountNumber(sourceAcc)
                            .destinationAccountNumber(destAcc)
                            .amount(BigDecimal.valueOf(500.00))
                            .description("Simulated Velocity Burst Transfer #" + i)
                            .location("New York, USA")
                            .latitude(40.7128)
                            .longitude(-74.0060)
                            .ipAddress("192.168.10.45")
                            .deviceFingerprint("dev-DemoSimulator")
                            .idempotencyKey("demo-burst-" + System.currentTimeMillis() + "-" + i)
                            .build();
                    lastResult = transactionService.processTransfer(req, "customer");
                }
                break;
            }
            case "impossible-velocity": {
                TransferRequestDto req = TransferRequestDto.builder()
                        .sourceAccountNumber(sourceAcc)
                        .destinationAccountNumber(destAcc)
                        .amount(BigDecimal.valueOf(1200.00))
                        .description("Simulated Geolocation Travel Velocity Anomaly")
                        .location("Tokyo, Japan")
                        .latitude(35.6762)
                        .longitude(139.6503)
                        .ipAddress("133.242.18.2")
                        .deviceFingerprint("dev-DemoSimulator-Tokyo")
                        .idempotencyKey("demo-velocity-" + System.currentTimeMillis())
                        .build();
                lastResult = transactionService.processTransfer(req, "customer");
                break;
            }
            case "structuring": {
                TransferRequestDto req = TransferRequestDto.builder()
                        .sourceAccountNumber(sourceAcc)
                        .destinationAccountNumber(destAcc)
                        .amount(BigDecimal.valueOf(9450.00))
                        .description("Simulated Structuring / Smurfing Anomaly ($9,450)")
                        .location("Zurich, Switzerland")
                        .latitude(47.3769)
                        .longitude(8.5417)
                        .ipAddress("193.134.25.9")
                        .deviceFingerprint("dev-DemoSimulator")
                        .idempotencyKey("demo-structuring-" + System.currentTimeMillis())
                        .build();
                lastResult = transactionService.processTransfer(req, "customer");
                break;
            }
            default:
                throw new IllegalArgumentException("Unknown simulation scenario: " + scenario);
        }

        return ResponseEntity.ok(Map.of(
                "scenario", scenario,
                "status", "SUCCESS",
                "message", "Simulated threat vector evaluated by Java Fraud Detection Engine",
                "transaction", lastResult
        ));
    }
}
