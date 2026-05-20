export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id_user: number;
  name: string;
  lastname: string;
  username: string;
  email: string | null;
  phone: string | null;
  birth_date: string;
  profile_picture: string | null;
  description: string | null;
  private_profile: boolean;
  foints_season: number;
  foints_total: number;
  id_role: number;
  created_at: string;
  active: boolean;
}

export interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
}
