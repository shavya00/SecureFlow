package com.secureflow.backend.service;

import com.secureflow.backend.dto.AuditLogDto;
import com.secureflow.backend.model.AuditLog;
import com.secureflow.backend.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void recordLog(UUID actorId, String action, String entityType, UUID entityId, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorId(actorId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .details(details)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.warn("Failed to write audit log: {}", ex.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::toDto);
    }

    public AuditLogDto toDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId() != null ? log.getId().toString() : null)
                .actorId(log.getActorId() != null ? log.getActorId().toString() : null)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId() != null ? log.getEntityId().toString() : null)
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null)
                .build();
    }
}
