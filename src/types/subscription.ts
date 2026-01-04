export interface SubscriptionRequest {
  phoneNumber: string;
  name: string;
}

export interface SubscriptionResponse {
  phoneNumber: string;
  message: string;
  subscribedAt: string;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  status?: number;
}

export interface AuthRequest {
  phoneNumber: string;
  password?: string;
  name?: string;
  verificationCode?: string;
  selectedCoins?: string[];
}

export interface Subscriber {
  phoneNumber: string;
  name: string;
  subscribedAt: string;
  cognitoUserId?: string;
  selectedCoins?: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  cognitoUserId?: string;
  subscriber?: Subscriber;
  requiresVerification?: boolean;
}

export interface CoinInfo {
  symbol: string;
  name: string;
  displayName: string;
}
