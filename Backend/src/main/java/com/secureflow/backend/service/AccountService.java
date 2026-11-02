package com.secureflow.backend.service;

import com.secureflow.backend.dto.AccountDto;
import com.secureflow.backend.model.Account;
import com.secureflow.backend.model.Customer;
import com.secureflow.backend.model.User;
import com.secureflow.backend.repository.AccountRepository;
import com.secureflow.backend.repository.CustomerRepository;
import com.secureflow.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AccountDto> getAccountsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        // If ADMIN or FRAUD_ANALYST, or CUSTOMER:
        Customer customer = customerRepository.findByAuthUserId(user.getId()).orElse(null);
        if (customer != null) {
            return accountRepository.findByCustomerId(customer.getId())
                    .stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        // Fallback for demo persona if customer profile has distinct auth_user_id
        if ("CUSTOMER".equalsIgnoreCase(user.getRole())) {
            List<Account> all = accountRepository.findAll();
            if (!all.isEmpty()) {
                // Return primary demo customer accounts (first 2)
                return all.stream().limit(2).map(this::toDto).collect(Collectors.toList());
            }
        }

        return Collections.emptyList();
    }

    @Transactional(readOnly = true)
    public List<AccountDto> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AccountDto getAccountById(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + id));
        return toDto(account);
    }

    public AccountDto toDto(Account account) {
        String num = account.getAccountNumber();
        String masked = num != null && num.length() > 4
                ? "**** " + num.substring(num.length() - 4)
                : "**** " + num;

        String ownerName = account.getCustomer() != null ? account.getCustomer().getFullName() : "Customer";
        String userId = account.getCustomer() != null && account.getCustomer().getAuthUserId() != null
                ? account.getCustomer().getAuthUserId().toString() : "";

        return AccountDto.builder()
                .id(account.getId() != null ? account.getId().toString() : null)
                .accountNumber(account.getAccountNumber())
                .maskedAccountNumber(masked)
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency() != null ? account.getCurrency().trim() : "USD")
                .status(account.getStatus())
                .dailyLimit(BigDecimal.valueOf(50000.00))
                .ownerName(ownerName)
                .userId(userId)
                .createdAt(account.getCreatedAt() != null ? account.getCreatedAt().toString() : null)
                .build();
    }
}
