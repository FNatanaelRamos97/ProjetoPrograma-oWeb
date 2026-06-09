import type {
  AdminDashboard,
  AuthResponse,
  AvailabilityDay,
  ProviderRequest,
  Review,
  ReviewListResponse,
  SalesLog,
  SalesStats,
  Service,
  Transaction,
  User,
  WalletBalance,
} from "../frontend/src/types/index.ts";

export interface AdminReview {
  id: number;
  appointmentId: number;
  serviceId: number;
  serviceName: string;
  clientId: number;
  clientName: string;
  providerId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
}

const API_URL = "http://localhost:3333";

function getAuthHeaders(token?: string | null): Record<string, string> {
  const finalToken = token || localStorage.getItem("conectserv_token");

  const headers: Record<string, string> = {};

  if (finalToken) {
    headers.Authorization = `Bearer ${finalToken}`;
  }

  return headers;
}

function getJsonAuthHeaders(token?: string | null): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...getAuthHeaders(token),
  };
}

export async function updateService(
  id: number | string,
  data: {
    name: string;
    category: string;
    price: number;
    description?: string;
  },
  token: string,
): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "PUT",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Erro ao editar serviço:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    return null;
  }

  return response.json();
}

export async function deleteServiceAdmin(
  id: number | string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Erro ao excluir serviço:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    return false;
  }

  return true;
}

export async function createUser(formData: FormData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: result.message,
      errors: result.errors,
    };
  }

  return {
    data: result as User,
    error: null,
    errors: null,
  };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse | null> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export interface ProviderAppointment {
  id: number;
  appointmentDate: string;
  status: "pendente" | "confirmado" | "concluido" | "cancelado";
  serviceId: number;
  serviceName: string;
  providerId: number;
  clientId: number;
  clientName: string;
  price: number;
  cancellationReason?: string | null;
  createdAt: string;
}

export async function getAdminReviews(token: string): Promise<AdminReview[]> {
  const response = await fetch(`${API_URL}/reviews/admin`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function listServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`);

  if (!response.ok) return [];

  return response.json();
}

export async function listServicesByProvider(
  providerId: number,
): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services/provider/${providerId}`);

  if (!response.ok) return [];

  return response.json();
}

export async function getMyProviderAppointments(
  token: string,
): Promise<ProviderAppointment[]> {
  const response = await fetch(`${API_URL}/appointments/provider/my`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function getServiceById(
  id: number | string,
): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services/${id}`);

  if (!response.ok) return null;

  return response.json();
}

export async function createService(
  formData: FormData,
  token: string,
): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) return null;

  return response.json();
}

export async function deleteService(
  id: number | string,
  token: string,
): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Erro ao excluir serviço:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro inesperado ao excluir serviço:", error);
    return false;
  }
}

export async function requestProviderRole(
  message: string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/provider-requests`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ message }),
  });

  return response.ok;
}

export async function listProviderRequests(
  token: string,
): Promise<ProviderRequest[]> {
  const response = await fetch(`${API_URL}/provider-requests`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function approveProviderRequest(
  id: number,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/provider-requests/${id}/approve`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });

  return response.ok;
}

export async function rejectProviderRequest(
  id: number,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/provider-requests/${id}/reject`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });

  return response.ok;
}

export async function getProviderAvailability(
  providerId: number,
  year: number,
  month: number,
): Promise<AvailabilityDay[]> {
  const response = await fetch(
    `${API_URL}/appointments/providers/${providerId}/availability?year=${year}&month=${month}`,
  );

  if (!response.ok) return [];

  return response.json();
}

export async function createAppointment(
  data: {
    serviceId: number;
    providerId: number;
    appointmentDate: string;
  },
  token: string,
) {
  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getAdminDashboard(
  token: string,
): Promise<AdminDashboard | null> {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return null;

  return response.json();
}

export async function listUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function listAdminServices(token: string): Promise<Service[]> {
  const response = await fetch(`${API_URL}/admin/services`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

// ─── Reviews ──────────────────────────────────────────────

export async function createReview(
  data: {
    appointmentId: number;
    serviceId: number;
    providerId: number;
    rating: number;
    comment: string;
  },
  token: string,
) {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify(data),
  });

  return response.ok ? response.json() : null;
}

export async function getServiceReviews(
  serviceId: number,
): Promise<ReviewListResponse> {
  const response = await fetch(`${API_URL}/reviews/service/${serviceId}`);

  if (!response.ok) {
    return { reviews: [], average: 0, total: 0 };
  }

  return response.json();
}

export async function getProviderReviews(
  providerId: number,
): Promise<Review[]> {
  const response = await fetch(`${API_URL}/reviews/provider/${providerId}`);

  if (!response.ok) return [];

  return response.json();
}

// ─── Wallet ───────────────────────────────────────────────

export async function getWalletBalance(token: string): Promise<number> {
  const response = await fetch(`${API_URL}/wallet/balance`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return 0;

  const data = await response.json();
  return data.balance;
}

export async function getWalletHistory(token: string): Promise<Transaction[]> {
  const response = await fetch(`${API_URL}/wallet/history`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function walletDeposit(
  amount: number,
  description: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/wallet/deposit`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ amount, description }),
  });

  return response.ok ? response.json() : null;
}

export async function walletWithdraw(
  amount: number,
  description: string,
  token: string,
) {
  const response = await fetch(`${API_URL}/wallet/withdraw`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ amount, description }),
  });

  return response.ok ? response.json() : null;
}

// ─── Sales Logs (Admin) ───────────────────────────────────

export async function getSalesLogs(token: string): Promise<SalesLog[]> {
  const response = await fetch(`${API_URL}/sales-logs`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function getSalesStats(token: string): Promise<SalesStats | null> {
  const response = await fetch(`${API_URL}/sales-logs/stats`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getRecentSales(token: string): Promise<SalesLog[]> {
  const response = await fetch(`${API_URL}/sales-logs/recent`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

// ─── Admin: All Transactions ──────────────────────────────

export async function getAllTransactions(
  token: string,
): Promise<Transaction[]> {
  const response = await fetch(`${API_URL}/wallet/transactions`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

// ─── Wallet: New Escrow API ───────────────────────────────

export async function getWalletFullBalance(
  token: string,
): Promise<WalletBalance> {
  const response = await fetch(`${API_URL}/wallet/balance`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return { balance: 0, available: 0, escrow: 0 };

  return response.json();
}

export async function getWalletEscrow(token: string): Promise<Transaction[]> {
  const response = await fetch(`${API_URL}/wallet/escrow`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function holdPayment(
  data: {
    clientId: number;
    providerId: number;
    amount: number;
    description: string;
    referenceType: string;
    referenceId: number;
  },
  token: string,
) {
  const response = await fetch(`${API_URL}/wallet/hold`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify(data),
  });

  return response.ok ? response.json() : null;
}

export async function releasePayment(
  referenceType: string,
  referenceId: number,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/wallet/release`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ referenceType, referenceId }),
  });

  return response.ok;
}

export async function cancelPayment(
  referenceType: string,
  referenceId: number,
  cancellationReason: string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/wallet/cancel`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ referenceType, referenceId, cancellationReason }),
  });

  return response.ok;
}

// ─── Profile ──────────────────────────────────────────────

export async function updateUserProfile(
  formData: FormData,
  token: string,
): Promise<User | null> {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: getAuthHeaders(token),
    body: formData,
  });

  if (!response.ok) return null;

  return response.json();
}

// ─── Appointments: Confirm / Cancel ───────────────────────

export async function getMyAppointments(token: string) {
  const response = await fetch(`${API_URL}/appointments/my`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function confirmAppointment(
  id: number,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/appointments/${id}/confirm`, {
    method: "PATCH",
    headers: getAuthHeaders(token),
  });

  return response.ok;
}

export async function cancelAppointment(
  id: number,
  reason: string,
  token: string,
): Promise<boolean> {
  const response = await fetch(`${API_URL}/appointments/${id}/cancel`, {
    method: "PATCH",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ cancellationReason: reason }),
  });

  return response.ok;
}

export interface ProviderUnavailableDate {
  id: number;
  providerId: number;
  unavailableDate: string;
  reason: string;
  createdAt: string;
}

export interface AdminAppointment {
  id: number;
  serviceId: number;
  serviceName: string;
  providerId: number;
  providerName: string;
  clientId: number;
  clientName: string;
  appointmentDate: string;
  status: "pendente" | "confirmado" | "cancelado";
  createdAt: string;
}

export async function listMyUnavailableDates(
  year: number,
  month: number,
  token: string,
): Promise<ProviderUnavailableDate[]> {
  const response = await fetch(
    `${API_URL}/provider-unavailable-dates/me?year=${year}&month=${month}`,
    {
      headers: getAuthHeaders(token),
    },
  );

  if (!response.ok) return [];

  return response.json();
}

export async function toggleMyUnavailableDate(
  date: string,
  token: string,
): Promise<{ unavailable: boolean; date: string } | null> {
  const response = await fetch(`${API_URL}/provider-unavailable-dates/toggle`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({
      date,
      reason: "Indisponível",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Erro ao atualizar indisponibilidade:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });

    return null;
  }

  return response.json();
}

export async function listAdminAppointments(
  token: string,
): Promise<AdminAppointment[]> {
  const response = await fetch(`${API_URL}/admin/appointments`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function createStripeCheckoutSession(
  appointmentId: number,
  token: string,
): Promise<{ checkoutUrl: string; sessionId: string } | null> {
  const response = await fetch(`${API_URL}/payments/checkout-session`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ appointmentId }),
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getStripeCheckoutSession(
  sessionId: string,
  token: string,
) {
  const response = await fetch(
    `${API_URL}/payments/checkout-session/${sessionId}`,
    {
      headers: getAuthHeaders(token),
    },
  );

  if (!response.ok) return null;

  return response.json();
}

export interface WithdrawalRequest {
  id: number;
  providerId: number;
  providerName?: string;
  providerEmail?: string;
  amount: number;
  status: "solicitado" | "aprovado" | "recusado" | "pago";
  description: string;
  adminNote?: string | null;
  createdAt: string;
  decidedAt?: string | null;
}

export async function requestWithdrawal(
  amount: number,
  description: string,
  token: string,
): Promise<WithdrawalRequest | null> {
  const response = await fetch(`${API_URL}/wallet/withdrawal-requests`, {
    method: "POST",
    headers: getJsonAuthHeaders(token),
    body: JSON.stringify({ amount, description }),
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getMyWithdrawalRequests(
  token: string,
): Promise<WithdrawalRequest[]> {
  const response = await fetch(`${API_URL}/wallet/withdrawal-requests/my`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function getAllWithdrawalRequests(
  token: string,
): Promise<WithdrawalRequest[]> {
  const response = await fetch(`${API_URL}/wallet/withdrawal-requests`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) return [];

  return response.json();
}

export async function approveWithdrawalRequest(
  id: number,
  token: string,
  adminNote = "",
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/wallet/withdrawal-requests/${id}/approve`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(token),
      body: JSON.stringify({ adminNote }),
    },
  );

  return response.ok;
}

export async function rejectWithdrawalRequest(
  id: number,
  token: string,
  adminNote = "",
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/wallet/withdrawal-requests/${id}/reject`,
    {
      method: "PATCH",
      headers: getJsonAuthHeaders(token),
      body: JSON.stringify({ adminNote }),
    },
  );

  return response.ok;
}
