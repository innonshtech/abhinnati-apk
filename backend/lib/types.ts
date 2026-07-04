export interface AuthenticatedRequestUser {
  id: string;
  phone: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  message?: string;
}

export type OnboardingStep = 'name_select' | 'permissions' | 'area_select' | 'role_select' | 'completed';

export interface UserProfileResponse {
  id: string;
  phone: string;
  fullName: string | null;
  displayName: string | null;
  profileImage: string | null;
  onboardingStep: string | null;
  role: string;
  language: string;
}
