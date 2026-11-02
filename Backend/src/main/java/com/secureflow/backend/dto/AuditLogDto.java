package com.secureflow.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    private String id;
    private String actorId;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private String createdAt;
}
