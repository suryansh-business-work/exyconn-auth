export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "god";
  organizationId?: string;
  isVerified: boolean;
  profilePicture?: string;
  provider?: "email" | "google";
  createdAt?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyOTPFormValues {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  orgRedirectionSettings?: Array<{
    authPagePath: string;
    redirectionUrl: string;
    env: string;
  }>;
}
