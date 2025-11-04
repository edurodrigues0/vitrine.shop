export type UserRole = "ADMIN" | "OWNER" | "EMPLOYEE";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  storeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  storeId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  storeId: string | null;
}

