import { http } from './http'

import type {
  CurrentUserResponse,
  LoginInput,
  LoginResponse,
  LogoutResponse,
} from '../types/auth'

export async function login(
  payload: LoginInput,
): Promise<LoginResponse> {
  const response = await http.post<LoginResponse>(
    '/auth/login',
    payload,
  )

  return response.data
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await http.get<CurrentUserResponse>('/auth/me')

  return response.data
}

export async function logout(): Promise<LogoutResponse> {
  const response = await http.post<LogoutResponse>('/auth/logout')

  return response.data
}
