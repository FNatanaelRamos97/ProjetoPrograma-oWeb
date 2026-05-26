import type {
  AdminDashboard,
  AuthResponse,
  AvailabilityDay,
  ProviderRequest,
  Service,
  User
} from "../frontend/src/types/index.ts";

const API_URL = "http://localhost:3333";

function getAuthHeaders(token?: string | null) {
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function createUser(formData: FormData) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: result.message,
      errors: result.errors
    };
  }

  return {
    data: result as User,
    error: null,
    errors: null
  };
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse | null> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function listServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`);

  if (!response.ok) return [];

  return response.json();
}

export async function listServicesByProvider(
  providerId: number
): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services/provider/${providerId}`);

  if (!response.ok) return [];

  return response.json();
}

export async function getServiceById(id: number): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services/${id}`);

  if (!response.ok) return null;

  return response.json();
}

export async function createService(
  formData: FormData,
  token: string
): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(token)
    },
    body: formData
  });

  if (!response.ok) return null;

  return response.json();
}

export async function deleteService(
  id: number,
  token: string
): Promise<boolean> {
  const response = await fetch(`${API_URL}/services/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(token)
    }
  });

  return response.ok;
}

export async function requestProviderRole(
  message: string,
  token: string
) {
  const response = await fetch(`${API_URL}/provider-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token)
    },
    body: JSON.stringify({ message })
  });

  return response.ok;
}

export async function listProviderRequests(
  token: string
): Promise<ProviderRequest[]> {
  const response = await fetch(`${API_URL}/provider-requests`, {
    headers: {
      ...getAuthHeaders(token)
    }
  });

  if (!response.ok) return [];

  return response.json();
}

export async function approveProviderRequest(
  id: number,
  token: string
) {
  const response = await fetch(`${API_URL}/provider-requests/${id}/approve`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(token)
    }
  });

  return response.ok;
}

export async function rejectProviderRequest(
  id: number,
  token: string
) {
  const response = await fetch(`${API_URL}/provider-requests/${id}/reject`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(token)
    }
  });

  return response.ok;
}

export async function getProviderAvailability(
  providerId: number,
  year: number,
  month: number
): Promise<AvailabilityDay[]> {
  const response = await fetch(
    `${API_URL}/appointments/providers/${providerId}/availability?year=${year}&month=${month}`
  );

  if (!response.ok) return [];

  return response.json();
}

export async function createAppointment(
  data: {
    serviceId: number
    providerId: number
    appointmentDate: string
  },
  token: string
) {
  const response = await fetch(`${API_URL}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token)
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) return null;

  return response.json();
}

export async function getAdminDashboard(
  token: string
): Promise<AdminDashboard | null> {
  const response = await fetch(`${API_URL}/admin/dashboard`, {
    headers: {
      ...getAuthHeaders(token)
    }
  });

  if (!response.ok) return null;

  return response.json();
}

export async function listUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      ...getAuthHeaders(token)
    }
  });

  if (!response.ok) return [];

  return response.json();
}

export async function listAdminServices(token: string): Promise<Service[]> {
  const response = await fetch(`${API_URL}/admin/services`, {
    headers: {
      ...getAuthHeaders(token)
    }
  });

  if (!response.ok) return [];

  return response.json();
}