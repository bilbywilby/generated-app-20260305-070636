import type { Template, Draft } from '../../worker/app-controller';
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const json = await response.json();
  if (!response.ok || !json.success) throw new Error(json.error || 'API Error');
  return json.data;
};
export const api = {
  templates: {
    list: () => fetcher<Template[]>('/api/templates'),
    create: (data: Omit<Template, 'id' | 'updatedAt'>) => 
      fetcher<Template>('/api/templates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Template>) => 
      fetcher<Template>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetcher<boolean>(`/api/templates/${id}`, { method: 'DELETE' }),
  },
  drafts: {
    list: () => fetcher<Draft[]>('/api/drafts'),
    get: (id: string) => fetcher<Draft>(`/api/drafts/${id}`),
    create: (data: Omit<Draft, 'id' | 'updatedAt'>) => 
      fetcher<Draft>('/api/drafts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Draft>) => 
      fetcher<Draft>(`/api/drafts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetcher<boolean>(`/api/drafts/${id}`, { method: 'DELETE' }),
  }
};