import { FriendlyError, getUserFriendlyHttpError } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private baseURL: string;
  private getAuthToken: () => string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.getAuthToken = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
      }
      return null;
    };
  }

  private isFormData(payload: unknown): payload is FormData {
    return typeof FormData !== 'undefined' && payload instanceof FormData;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken();
    const isFormDataPayload = this.isFormData(options.body);
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!isFormDataPayload && options.body !== undefined && !(options.body instanceof Blob)) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch {
      throw new FriendlyError(
        "We can't reach the server right now. Check your internet connection, then try again. If you're running the app on your computer, make sure the backend service is started.",
      );
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = getUserFriendlyHttpError(
        response.status,
        body as { message?: string | string[]; error?: string },
      );
      throw new FriendlyError(message, response.status);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const body =
      data === undefined
        ? undefined
        : this.isFormData(data)
          ? data
          : JSON.stringify(data);

    return this.request<T>(endpoint, {
      method: 'POST',
      body,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const body =
      data === undefined
        ? undefined
        : this.isFormData(data)
          ? data
          : JSON.stringify(data);

    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const body =
      data === undefined
        ? undefined
        : this.isFormData(data)
          ? data
          : JSON.stringify(data);

    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
