export interface SubscriptionRequest {
  phoneNumber: string;
  name: string;
}

export interface SubscriptionResponse {
  phoneNumber: string;
  message: string;
  subscribedAt: string;
}

export interface ApiError {
  error?: string;
  message?: string;
  status?: number;
}
