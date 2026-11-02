package com.secureflow.backend.service;

import com.secureflow.backend.dto.*;
import com.secureflow.backend.model.Account;
import com.secureflow.backend.model.Customer;
import com.secureflow.backend.model.User;
import com.secureflow.backend.repository.AccountRepository;
import com.secureflow.backend.repository.CustomerRepository;
import com.secureflow.backend.repository.UserRepository;
import com.secureflow.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountService accountService;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditLogService.recordLog(
                    user.getId(),
                    "LOGIN_FAILED",
                    "USER",
                    user.getId(),
                    "{\"reason\": \"Bad credentials\"}",
                    "127.0.0.1"
            );
            throw new IllegalArgumentException("Invalid username or password.");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole(), user.getFullName());
        List<AccountDto> accounts = accountService.getAccountsForUser(user.getUsername());

        auditLogService.recordLog(
                user.getId(),
                "USER_LOGIN",
                "USER",
                user.getId(),
                "{\"status\": \"SUCCESS\", \"role\": \"" + user.getRole() + "\"}",
                "127.0.0.1"
        );

        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .accounts(accounts)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already in use.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use.");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .role("CUSTOMER")
                .status("ACTIVE")
                .build();
        user = userRepository.save(user);

        Customer customer = Customer.builder()
                .authUserId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .build();
        customer = customerRepository.save(customer);

        // Provision initial checking account
        String accNum = "SENT-" + (1000 + new Random().nextInt(9000)) + "-001";
        Account account = Account.builder()
                .customer(customer)
                .accountNumber(accNum)
                .accountType("CURRENT")
                .balance(BigDecimal.valueOf(10000.00))
                .currency("USD")
                .status("ACTIVE")
                .build();
        accountRepository.save(account);

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getRole(), user.getFullName());
        List<AccountDto> accounts = accountService.getAccountsForUser(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .user(toUserDto(user))
                .accounts(accounts)
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
        return toUserDto(user);
    }

    public UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId() != null ? user.getId().toString() : null)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
