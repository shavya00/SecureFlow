import {
  User, Account, Transaction, FraudAlert, FraudRule,
  DashboardOverview, TransferRequest, AlertStatus
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('sentinel_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      errorData = { message: res.statusText || 'Unknown network error' };
    }
    const msg = errorData.message || errorData.error || `Request failed with status ${res.status}`;
    const error: any = new Error(msg);
    error.status = res.status;
    error.data = errorData;
    throw error;
  }
  return res.json();
}

export const api = {
  // Authentication
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse<{ token: string; user: User; accounts: Account[] }>(res);
  },

  async register(data: { username: string; email: string; password: string; fullName: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ token: string; user: User; accounts: Account[] }>(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<User>(res);
  },

  // Accounts
  async getMyAccounts(): Promise<Account[]> {
    const res = await fetch(`${API_BASE}/accounts`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<Account[]>(res);
  },

  async getAccountById(id: string): Promise<Account> {
    const res = await fetch(`${API_BASE}/accounts/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<Account>(res);
  },

  // Transactions
  async transfer(data: TransferRequest): Promise<Transaction> {
    const idempKey = data.idempotencyKey || `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const res = await fetch(`${API_BASE}/transactions/transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempKey,
        ...getAuthHeader()
      },
      body: JSON.stringify({ ...data, idempotencyKey: idempKey })
    });
    return handleResponse<Transaction>(res);
  },

  async getMyTransactions(page = 0, size = 20): Promise<{ content: Transaction[]; totalElements: number }> {
    const res = await fetch(`${API_BASE}/transactions?page=${page}&size=${size}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ content: Transaction[]; totalElements: number }>(res);
  },

  async reverseTransaction(id: string, reason: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}/reverse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ reason })
    });
    return handleResponse<Transaction>(res);
  },

  // Fraud Management
  async getFraudAlerts(page = 0, size = 20): Promise<{ content: FraudAlert[]; totalElements: number }> {
    const res = await fetch(`${API_BASE}/fraud/alerts?page=${page}&size=${size}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ content: FraudAlert[]; totalElements: number }>(res);
  },

  async getFraudAlertById(id: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/fraud/alerts/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<FraudAlert>(res);
  },

  async markInvestigating(id: string, note?: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/fraud/alerts/${id}/investigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ note })
    });
    return handleResponse<FraudAlert>(res);
  },

  async resolveAlert(id: string, status: AlertStatus, note?: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/fraud/alerts/${id}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status, note })
    });
    return handleResponse<FraudAlert>(res);
  },

  async addAlertNote(id: string, note: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/fraud/alerts/${id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ note })
    });
    return handleResponse<FraudAlert>(res);
  },

  // Administration & Analytics
  async getDashboardOverview(): Promise<DashboardOverview> {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<DashboardOverview>(res);
  },

  async getAllLiveTransactions(page = 0, size = 50): Promise<{ content: Transaction[]; totalElements: number }> {
    const res = await fetch(`${API_BASE}/admin/transactions?page=${page}&size=${size}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ content: Transaction[]; totalElements: number }>(res);
  },

  async getAllAccounts(): Promise<Account[]> {
    const res = await fetch(`${API_BASE}/accounts/all`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<Account[]>(res);
  },

  async getFraudRules(): Promise<FraudRule[]> {
    const res = await fetch(`${API_BASE}/admin/fraud-rules`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<FraudRule[]>(res);
  },

  async updateFraudRule(id: string, data: Partial<FraudRule>): Promise<FraudRule> {
    const res = await fetch(`${API_BASE}/admin/fraud-rules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return handleResponse<FraudRule>(res);
  },

  async getAuditLogs(page = 0, size = 30): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/audit-logs?page=${page}&size=${size}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<any>(res);
  },

  // Demo Simulation Triggers
  async triggerDemo(scenario: 'large-amount' | 'rapid-burst' | 'impossible-velocity' | 'structuring') {
    const res = await fetch(`${API_BASE}/demo/trigger/${scenario}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      }
    });
    return handleResponse<any>(res);
  }
};
