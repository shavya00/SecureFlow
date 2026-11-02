package com.secureflow.backend;

import com.secureflow.backend.dto.AccountDto;
import com.secureflow.backend.dto.DashboardOverviewDto;
import com.secureflow.backend.service.AccountService;
import com.secureflow.backend.service.DashboardAnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabaseValidationTest {

    @Autowired
    private AccountService accountService;

    @Autowired
    private DashboardAnalyticsService dashboardAnalyticsService;

    @Test
    void testContextLoadsAndHibernateValidates() {
        System.out.println("Verifying Hibernate entity validation and database seed data...");

        List<AccountDto> accounts = accountService.getAllAccounts();
        assertNotNull(accounts);
        assertFalse(accounts.isEmpty(), "Accounts should be seeded");
        System.out.println("Successfully queried accounts count: " + accounts.size());
        for (AccountDto acc : accounts) {
            System.out.println(" - " + acc.getAccountNumber() + " | " + acc.getAccountType() + " | Balance: $" + acc.getBalance() + " (" + acc.getOwnerName() + ")");
        }

        DashboardOverviewDto overview = dashboardAnalyticsService.getDashboardOverview();
        assertNotNull(overview);
        assertTrue(overview.getTotalTransactions() > 0, "Dashboard should reflect seeded transactions");
        System.out.println("Dashboard total transactions: " + overview.getTotalTransactions());
        System.out.println("Dashboard gross volume: $" + overview.getTotalTransactionVolume());
        System.out.println("Dashboard fraud rate: " + overview.getFraudDetectionRate() + "%");
    }
}
