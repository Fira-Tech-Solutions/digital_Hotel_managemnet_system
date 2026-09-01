// When running through Vite dev proxy, just use relative URLs.
// In production, set VITE_API_URL to the full backend URL like http://localhost:4000.
const BASE_URL = import.meta.env.VITE_API_URL || '';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers: extraHeaders = {}, isFormData = false } = options;

  const headers: Record<string, string> = { ...extraHeaders };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
    ...(body
      ? { body: isFormData ? (body as FormData) : JSON.stringify(body) }
      : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || 'API request failed', res.status);
  }

  return json.data as T;
}
