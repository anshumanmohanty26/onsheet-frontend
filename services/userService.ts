import { api } from "./api";

export interface User {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export const userService = {
  register: (body: { name: string; email: string; password: string }) =>
    api.post<User>("/auth/register", body),

  login: (body: { email: string; password: string }) => api.post<User>("/auth/login", body),

  logout: () => api.post<void>("/auth/logout"),

  me: () => api.get<User>("/auth/me"),

  updateProfile: (body: { displayName?: string; avatarUrl?: string }) =>
    api.patch<User>("/users/me", body),

  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.patch<void>("/users/me/password", body),

  deleteAccount: () => api.delete<void>("/users/me"),
};
