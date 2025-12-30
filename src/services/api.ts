import { SubscriptionRequest, SubscriptionResponse } from '../types/subscription';

const API_BASE_URL = import.meta.env.VITE_API_URL ||
  'https://t36fs02kh1.execute-api.us-east-1.amazonaws.com/dev';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

export async function subscribeUser(data: SubscriptionRequest): Promise<SubscriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Subscription failed';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as SubscriptionResponse;
}
