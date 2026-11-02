package com.secureflow.backend.repository;

import com.secureflow.backend.model.FraudAlert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, UUID> {
    Page<FraudAlert> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<FraudAlert> findTop5ByOrderByCreatedAtDesc();
    long countBySeverity(String severity);
    long countByInvestigationStatus(String investigationStatus);
}
