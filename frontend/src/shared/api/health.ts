export interface HealthResponse {
  status: 'ok';
  service: 'zootracker-api';
}

import { apiRequest } from './http';

export function getApiHealth(): Promise<HealthResponse> {
  return apiRequest<HealthResponse>('/health');
}
