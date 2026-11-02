package com.secureflow.backend.repository;

import com.secureflow.backend.model.FraudRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FraudRuleRepository extends JpaRepository<FraudRule, UUID> {
    Optional<FraudRule> findByRuleCode(String ruleCode);
    List<FraudRule> findByEnabledTrue();
}
