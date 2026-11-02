package com.secureflow.backend.controller;

import com.secureflow.backend.dto.FraudAlertDto;
import com.secureflow.backend.service.FraudAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/fraud")
@RequiredArgsConstructor
public class FraudController {

    private final FraudAlertService fraudAlertService;

    @GetMapping("/alerts")
    public ResponseEntity<Page<FraudAlertDto>> getAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(fraudAlertService.getAlerts(pageRequest));
    }

    @GetMapping("/alerts/{id}")
    public ResponseEntity<FraudAlertDto> getAlertById(@PathVariable UUID id) {
        return ResponseEntity.ok(fraudAlertService.getAlertById(id));
    }

    @PostMapping("/alerts/{id}/investigate")
    public ResponseEntity<FraudAlertDto> markInvestigating(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {
        String note = body != null ? body.get("note") : null;
        String username = principal != null ? principal.getName() : "analyst";
        return ResponseEntity.ok(fraudAlertService.markInvestigating(id, note, username));
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<FraudAlertDto> resolveAlert(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String status = body != null ? body.get("status") : "RESOLVED";
        String note = body != null ? body.get("note") : null;
        String username = principal != null ? principal.getName() : "analyst";
        return ResponseEntity.ok(fraudAlertService.resolveAlert(id, status, note, username));
    }

    @PostMapping("/alerts/{id}/notes")
    public ResponseEntity<FraudAlertDto> addAlertNote(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String note = body != null ? body.get("note") : "";
        String username = principal != null ? principal.getName() : "analyst";
        return ResponseEntity.ok(fraudAlertService.addNote(id, note, username));
    }
}
