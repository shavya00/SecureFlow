package com.secureflow.backend.controller;

import com.secureflow.backend.dto.AuthRequest;
import com.secureflow.backend.dto.AuthResponse;
import com.secureflow.backend.dto.RegisterRequest;
import com.secureflow.backend.dto.UserDto;
import com.secureflow.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Principal principal) {
        String username = principal != null ? principal.getName() : "customer";
        return ResponseEntity.ok(authService.getCurrentUser(username));
    }
}
