package com.secureflow.backend.repository;

import com.secureflow.backend.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByReferenceId(String referenceId);

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.senderAccount.id IN :accountIds OR t.receiverAccount.id IN :accountIds ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccountIds(@Param("accountIds") List<UUID> accountIds, Pageable pageable);

    Page<Transaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Transaction> findTop10ByOrderByCreatedAtDesc();

    // Heuristic velocity checks
    long countBySenderAccountIdAndCreatedAtAfter(UUID senderAccountId, Instant timestamp);

    long countBySenderAccountIdAndStatusAndCreatedAtAfter(UUID senderAccountId, String status, Instant timestamp);

    Optional<Transaction> findFirstBySenderAccountIdOrderByCreatedAtDesc(UUID senderAccountId);

    long countByStatus(String status);
}
