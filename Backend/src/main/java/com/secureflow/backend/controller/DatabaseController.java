package com.secureflow.backend.controller;

import com.secureflow.backend.dto.DatabaseHealthResponse;
import com.secureflow.backend.service.DatabaseHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller providing database health check verification endpoints.
 */
@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
public class DatabaseController {

    private final DatabaseHealthService databaseHealthService;

    /**
     * Verifies the PostgreSQL connection by executing SELECT 1.
     *
     * @return 200 OK if connection succeeds, 503 SERVICE UNAVAILABLE if connection fails
     */
    @GetMapping("/database")
    public ResponseEntity<DatabaseHealthResponse> checkDatabase() {
        DatabaseHealthResponse response = databaseHealthService.checkDatabaseHealth();

        if ("UP".equalsIgnoreCase(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
