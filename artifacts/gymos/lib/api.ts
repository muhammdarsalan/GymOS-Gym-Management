import { customFetch } from '@workspace/api-client-react';

export type CurrentUser = {
  userId: string;
  email: string;
  role: string;
  gym: { id: string; name: string };
};

export function getMe(): Promise<CurrentUser> {
  if (!process.env.EXPO_PUBLIC_API_URL) {
    return Promise.reject(new Error('EXPO_PUBLIC_API_URL is required for authenticated API requests.'));
  }
  return customFetch<CurrentUser>('/api/me', { method: 'GET', responseType: 'json' });
}
