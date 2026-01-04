import {
  SubscriptionRequest,
  SubscriptionResponse,
  AuthRequest,
  AuthResponse,
  CoinInfo
} from '../types/subscription';

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

export async function signUp(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Sign up failed';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as AuthResponse;
}

export async function verifyPhone(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Verification failed';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as AuthResponse;
}

export async function signIn(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Sign in failed';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as AuthResponse;
}

export async function completeSignup(data: AuthRequest): Promise<SubscriptionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/complete-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Failed to complete signup';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as SubscriptionResponse;
}

export async function getPopularCoins(limit: number = 100): Promise<CoinInfo[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/coins/popular?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData = await response.json().catch(() => []);

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to fetch coins');
  }

  return responseData as CoinInfo[];
}

export async function updateCoins(
  phoneNumber: string,
  selectedCoins: string[],
  accessToken: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/coins`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ phoneNumber, selectedCoins }),
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = responseData.message || responseData.error || 'Failed to update coins';
    throw new ApiError(response.status, errorMessage);
  }

  return responseData as AuthResponse;
}
