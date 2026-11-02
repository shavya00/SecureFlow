package com.secureflow.backend.service;

import com.secureflow.backend.dto.DatabaseHealthResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Service to verify PostgreSQL database connectivity by executing SELECT 1.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseHealthService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Executes 'SELECT 1' against the database and constructs a health response.
     *
     * @return DatabaseHealthResponse indicating connection status (UP / DOWN)
     */
    public DatabaseHealthResponse checkDatabaseHealth() {
        Map<String, Object> details = new HashMap<>();
        try {
            log.info("Testing PostgreSQL database connectivity with: SELECT 1");
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

            if (result != null && result == 1) {
                details.put("query", "SELECT 1");
                details.put("queryResult", result);
                details.put("connectivity", "ESTABLISHED");

                return DatabaseHealthResponse.builder()
                        .status("UP")
                        .database("PostgreSQL")
                        .message("PostgreSQL database connection is healthy and responsive.")
                        .timestamp(Instant.now())
                        .details(details)
                        .build();
            } else {
                details.put("queryResult", result);
                return DatabaseHealthResponse.builder()
                        .status("DOWN")
                        .database("PostgreSQL")
                        .message("Unexpected query result during connectivity check.")
                        .timestamp(Instant.now())
                        .details(details)
                        .build();
            }
        } catch (DataAccessException dae) {
            String rootCauseMessage = dae.getRootCause() != null ? dae.getRootCause().getMessage() : dae.getMessage();
            log.error("Database connection failure: {}", rootCauseMessage);

            details.put("errorType", dae.getClass().getSimpleName());
            details.put("errorMessage", rootCauseMessage);

            return DatabaseHealthResponse.builder()
                    .status("DOWN")
                    .database("PostgreSQL")
                    .message("Failed to connect to PostgreSQL database.")
                    .timestamp(Instant.now())
                    .details(details)
                    .build();
        } catch (Exception ex) {
            log.error("Unexpected error during database health check", ex);
            details.put("errorType", ex.getClass().getSimpleName());
            details.put("errorMessage", ex.getMessage());

            return DatabaseHealthResponse.builder()
                    .status("DOWN")
                    .database("PostgreSQL")
                    .message("An unexpected error occurred during database health verification.")
                    .timestamp(Instant.now())
                    .details(details)
                    .build();
        }
    }
}
