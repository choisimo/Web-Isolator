import { WorkspaceV2, WorkspaceSchema, ProjectV2, ServiceV2 } from '@/types/workspace';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class WorkspaceService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Workspace operations
  async listWorkspaces(): Promise<WorkspaceV2[]> {
    return this.fetchApi<WorkspaceV2[]>('/api/workspaces');
  }

  async getWorkspace(workspaceId: string): Promise<WorkspaceV2> {
    return this.fetchApi<WorkspaceV2>(`/api/workspaces/${workspaceId}`);
  }

  async getCurrentWorkspace(): Promise<WorkspaceV2> {
    return this.fetchApi<WorkspaceV2>('/api/workspaces/current');
  }

  async createWorkspace(name: string, description?: string): Promise<WorkspaceV2> {
    return this.fetchApi<WorkspaceV2>('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.fetchApi(`/api/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });
  }

  // Project operations
  async listProjects(workspaceId?: string): Promise<ProjectV2[]> {
    const url = workspaceId 
      ? `/api/projects?workspace_id=${workspaceId}`
      : '/api/projects';
    return this.fetchApi<ProjectV2[]>(url);
  }

  async getProject(projectId: string): Promise<ProjectV2> {
    return this.fetchApi<ProjectV2>(`/api/projects/${projectId}`);
  }

  async getProjectByName(name: string): Promise<ProjectV2> {
    return this.fetchApi<ProjectV2>(`/api/projects/by-name/${name}`);
  }

  async createProject(
    workspaceId: string,
    name: string,
    path: string,
    provider: 'docker' | 'vm' = 'docker'
  ): Promise<ProjectV2> {
    return this.fetchApi<ProjectV2>('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ workspace_id: workspaceId, name, path, provider }),
    });
  }

  async updateProjectStatus(projectId: string, status: ProjectV2['status']): Promise<void> {
    await this.fetchApi(`/api/projects/${projectId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.fetchApi(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Service operations
  async listServices(projectId: string): Promise<ServiceV2[]> {
    return this.fetchApi<ServiceV2[]>(`/api/projects/${projectId}/services`);
  }

  async getService(serviceId: string): Promise<ServiceV2> {
    return this.fetchApi<ServiceV2>(`/api/services/${serviceId}`);
  }

  async createService(
    projectId: string,
    serviceData: Omit<ServiceV2, 'id'>
  ): Promise<ServiceV2> {
    return this.fetchApi<ServiceV2>(`/api/projects/${projectId}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(serviceId: string, serviceData: Partial<ServiceV2>): Promise<ServiceV2> {
    return this.fetchApi<ServiceV2>(`/api/services/${serviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(serviceData),
    });
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.fetchApi(`/api/services/${serviceId}`, {
      method: 'DELETE',
    });
  }

  // Environment variable operations
  async getEnvironmentVariables(serviceId: string): Promise<Record<string, string>> {
    return this.fetchApi<Record<string, string>>(`/api/services/${serviceId}/environment`);
  }

  async setEnvironmentVariable(
    serviceId: string,
    key: string,
    value: string,
    isSecret = false
  ): Promise<void> {
    await this.fetchApi(`/api/services/${serviceId}/environment`, {
      method: 'POST',
      body: JSON.stringify({ key, value, is_secret: isSecret }),
    });
  }

  async deleteEnvironmentVariable(serviceId: string, key: string): Promise<void> {
    await this.fetchApi(`/api/services/${serviceId}/environment/${key}`, {
      method: 'DELETE',
    });
  }

  // Workspace import/export operations
  async exportWorkspace(workspaceId?: string, includeSecrets = false): Promise<WorkspaceSchema> {
    const url = `/api/workspaces/export${workspaceId ? `/${workspaceId}` : ''}`;
    const params = new URLSearchParams();
    if (includeSecrets) params.append('include_secrets', 'true');
    
    return this.fetchApi<WorkspaceSchema>(`${url}?${params}`);
  }

  async importWorkspace(workspaceData: WorkspaceSchema, overwrite = false): Promise<{
    workspaceId: string;
    projectCount: number;
  }> {
    return this.fetchApi<{
      workspaceId: string;
      projectCount: number;
    }>('/api/workspaces/import', {
      method: 'POST',
      body: JSON.stringify({ workspace_data: workspaceData, overwrite }),
    });
  }

  async validateWorkspace(workspaceData: WorkspaceSchema): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    return this.fetchApi<{
      valid: boolean;
      errors?: string[];
    }>('/api/workspaces/validate', {
      method: 'POST',
      body: JSON.stringify(workspaceData),
    });
  }

  // Project control operations
  async startProject(projectId: string): Promise<void> {
    await this.fetchApi(`/api/projects/${projectId}/start`, {
      method: 'POST',
    });
  }

  async stopProject(projectId: string): Promise<void> {
    await this.fetchApi(`/api/projects/${projectId}/stop`, {
      method: 'POST',
    });
  }

  async restartProject(projectId: string): Promise<void> {
    await this.fetchApi(`/api/projects/${projectId}/restart`, {
      method: 'POST',
    });
  }

  async buildProject(projectId: string, force = false): Promise<void> {
    const params = new URLSearchParams();
    if (force) params.append('force', 'true');
    
    await this.fetchApi(`/api/projects/${projectId}/build?${params}`, {
      method: 'POST',
    });
  }

  // Logs
  async getProjectLogs(projectId: string, lines = 100): Promise<{
    [serviceName: string]: Array<{
      timestamp: string;
      level: string;
      message: string;
    }>;
  }> {
    return this.fetchApi(`/api/projects/${projectId}/logs?lines=${lines}`);
  }

  async getServiceLogs(serviceId: string, lines = 100): Promise<Array<{
    timestamp: string;
    level: string;
    message: string;
  }>> {
    return this.fetchApi(`/api/services/${serviceId}/logs?lines=${lines}`);
  }

  // Real-time updates via WebSocket (if supported)
  createWorkspaceWebSocket(): WebSocket | null {
    if (typeof window === 'undefined') return null;
    
    const wsUrl = API_BASE_URL.replace(/^https?/, 'ws') + '/ws/workspace';
    return new WebSocket(wsUrl);
  }
}

// Export singleton instance
export const workspaceService = new WorkspaceService();