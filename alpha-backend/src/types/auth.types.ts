export interface RegisterRequest {
  phone_number: string;
  full_name: string;
  birth_date: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  phone_number: string;
  otp_expires_in: number;
}

export interface VerifyOtpRequest {
  phone_number: string;
  otp: string;
}

export interface LoginRequest {
  phone_number: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ResendOtpRequest {
  phone_number: string;
  purpose: 'registration' | 'login' | 'password_reset';
}

export interface UserInfo {
  id: string;
  phone_number: string;
  full_name: string;
  is_onboarded: boolean;
  status: string;
  created_at: string;
}

export interface JwtPayload {
  sub: string; // user id
  phone: string;
  name: string;
  iat: number;
  exp: number;
}

export interface JwtRefreshPayload {
  sub: string; // user id
  type: 'refresh';
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  phone_number: string;
  full_name: string;
  status: string;
  is_onboarded: boolean;
}

// OTP related types
export interface OtpCode {
  id: string;
  phone_number: string;
  code: string;
  purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET';
  is_used: boolean;
  attempts: number;
  expires_at: Date;
  created_at: Date;
}

export interface OtpValidationResult {
  isValid: boolean;
  isExpired: boolean;
  attemptsRemaining: number;
  error?: string;
}

// Session types
export interface UserSession {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  device_info?: {
    platform?: string;
    app_version?: string;
    device_id?: string;
  };
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at: Date;
  last_used_at: Date;
  created_at: Date;
}

// Password reset types
export interface ForgotPasswordRequest {
  phone_number: string;
}

export interface ResetPasswordRequest {
  phone_number: string;
  otp: string;
  new_password: string;
}

// Rate limiting types
export interface RateLimitInfo {
  attempts: number;
  last_attempt: Date;
  blocked_until?: Date;
}

// Security event types
export interface SecurityEvent {
  event_type: 'login_attempt' | 'otp_request' | 'password_reset' | 'suspicious_activity';
  user_id?: string;
  phone_number: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  details?: Record<string, any>;
  timestamp: Date;
}

// Device information
export interface DeviceInfo {
  platform?: 'ios' | 'android' | 'web';
  app_version?: string;
  device_id?: string;
  device_name?: string;
  os_version?: string;
  push_token?: string;
}