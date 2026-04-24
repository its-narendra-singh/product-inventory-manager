import api from '../api/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<{ data: AuthResponse }>('/api/auth/login', { email, password });
  return data.data;
}

export async function registerApi(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<{ data: AuthResponse }>('/api/auth/register', {
    name,
    email,
    password,
  });
  return data.data;
}

export async function refreshApi(): Promise<string> {
  const { data } = await api.post<{ data: { accessToken: string } }>('/api/auth/refresh');
  return data.data.accessToken;
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout');
}
