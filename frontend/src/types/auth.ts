export interface User {
  id: number;
  name: string;
  email: string;
  auth_provider?: string;
  avatar_url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ApiValidationErrorItem {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiErrorResponse {
  detail?: string | ApiValidationErrorItem[] | unknown;
}
