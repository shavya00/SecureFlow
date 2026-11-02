package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

/**
 * Data Transfer Object representing the database health verification response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DatabaseHealthResponse {

    private String status;
    private String database;
    private String message;
    private Instant timestamp;
    private Map<String, Object> details;
}
