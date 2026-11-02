package com.secureflow.backend.controller;

import com.secureflow.backend.dto.ReverseRequestDto;
import com.secureflow.backend.dto.TransactionDto;
import com.secureflow.backend.dto.TransferRequestDto;
import com.secureflow.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/transfer")
    public ResponseEntity<TransactionDto> transfer(
            @Valid @RequestBody TransferRequestDto request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            Principal principal) {
        if (request.getIdempotencyKey() == null && idempotencyKeyHeader != null) {
            request.setIdempotencyKey(idempotencyKeyHeader);
        }
        String username = principal != null ? principal.getName() : "customer";
        TransactionDto result = transactionService.processTransfer(request, username);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<Page<TransactionDto>> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        String username = principal != null ? principal.getName() : "customer";
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(transactionService.getTransactionsForUser(username, pageRequest));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<TransactionDto> reverseTransaction(
            @PathVariable UUID id,
            @Valid @RequestBody ReverseRequestDto request,
            Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        TransactionDto result = transactionService.reverseTransaction(id, request.getReason(), username);
        return ResponseEntity.ok(result);
    }
}
