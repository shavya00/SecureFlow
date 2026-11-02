export type UserRole = 'CUSTOMER' | 'FRAUD_ANALYST' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'FROZEN' | 'BLOCKED';
export type AccountType = 'CHECKING' | 'SAVINGS' | 'BUSINESS';

export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'REVERSAL';
export type TransactionStatus = 'INITIATED' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'FLAGGED' | 'BLOCKED' | 'FAILED' | 'REVERSED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'CONFIRMED_FRAUD' | 'FALSE_POSITIVE' | 'RESOLVED';
export type RuleAction = 'FLAG' | 'HOLD' | 'BLOCK';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
}

export interface Account {
  id: string;
  accountNumber: string;
  maskedAccountNumber: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  status: AccountStatus;
  dailyLimit: number;
  ownerName: string;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  referenceId: string;
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  sourceOwnerName: string;
  destinationOwnerName: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  description: string;
  location?: string;
  ipAddress?: string;
  idempotencyKey?: string;
  failureReason?: string;
  createdAt: string;
}

export interface InvestigationNote {
  id: string;
  authorName: string;
  note: string;
  createdAt: string;
}

export interface FraudAlert {
  id: string;
  transactionId: string;
  referenceId: string;
  transactionAmount: number;
  customerAccountNumber: string;
  customerName: string;
  category: string;
  riskScore: number;
  severity: AlertSeverity;
  reason: string;
  status: AlertStatus;
  investigatedByName?: string;
  resolvedAt?: string;
  createdAt: string;
  notes: InvestigationNote[];
}

export interface FraudRule {
  id: string;
  ruleName: string;
  ruleCode: string;
  description: string;
  weightScore: number;
  thresholdValue: string;
  timeWindowSeconds: number;
  action: RuleAction;
  enabled: boolean;
}

export interface DashboardOverview {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  flaggedTransactions: number;
  blockedTransactions: number;
  totalTransactionVolume: number;
  fraudDetectionRate: number;
  highRiskAccounts: number;
  recentTransactions: Transaction[];
  recentAlerts: FraudAlert[];
  transactionsOverTime: Array<{ time: string; normal: number; flagged: number; blocked: number }>;
  riskDistribution: Array<{ level: string; count: number }>;
  volumeByCategory: Array<{ category: string; amount: number }>;
  alertsBySeverity: Array<{ severity: string; count: number }>;
}

export interface TransferRequest {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  currency?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  ipAddress?: string;
  deviceFingerprint?: string;
  idempotencyKey?: string;
}
