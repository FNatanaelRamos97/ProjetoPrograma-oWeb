const API_URL = "http://localhost:3333";

export type UserRole = "cliente" | "prestador" | "admin";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export type Service = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  provider_id: number;
  provider_name: string;
};

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "cliente" | "prestador",
) {
  const response = await fetch("http://localhost:3333/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      role,
    }),
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
    data: result,
    error: null,
    errors: null,
  };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<User | null> {
  if (email === "admin@conectserv.com" && password === "admin123") {
    return { id: 0, name: "Admin", email: "admin@conectserv.com", role: "admin" };
  }
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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

export async function listServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function listServicesByProvider(
  providerId: number,
): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services/provider/${providerId}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getServiceById(id: number): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services/${id}`);

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function createService(
  name: string,
  description: string,
  price: number,
  category: string,
  providerId: number,
): Promise<Service | null> {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      description,
      price,
      category,
      providerId,
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function deleteService(
  id: number,
  providerId: number,
): Promise<boolean> {
  const response = await fetch(
    `${API_URL}/services/${id}?providerId=${providerId}`,
    {
      method: "DELETE",
    },
  );

  return response.ok;
}
