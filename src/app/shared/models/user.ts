export type Role = 'customer' | 'provider' | 'admin';

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}