import { Project, LogEntry, SystemStats } from '@/types/project';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  frontend?: {
    framework: string;
    buildCommand?: string;
    startCommand?: string;
    port?: number;
  };
  backend?: {
    framework: string;
    buildCommand?: string;
    startCommand?: string;
    port?: number;
  };
  database?: {
    type: string;
    port?: number;
  };
  environment?: {
    mode: string;
    variables?: Record<string, string>;
  };
}

class ApiClient {
  private baseUrl: string;
  private wsUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    this.wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'API request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // 프로젝트 관련 API
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/api/projects');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}`);
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    return this.request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async startProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}/start`, {
      method: 'POST',
    });
  }

  async stopProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}/stop`, {
      method: 'POST',
    });
  }

  async restartProject(id: string): Promise<Project> {
    return this.request<Project>(`/api/projects/${id}/restart`, {
      method: 'POST',
    });
  }

  // 로그 관련 API
  async getProjectLogs(
    id: string, 
    service: 'frontend' | 'backend' | 'database'
  ): Promise<LogEntry[]> {
    return this.request<LogEntry[]>(`/api/projects/${id}/logs/${service}`);
  }

  // 시스템 통계 API
  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/api/system/stats');
  }

  // WebSocket 연결
  createWebSocket(onMessage?: (data: any) => void): WebSocket | null {
    try {
      const ws = new WebSocket(this.wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        if (onMessage) {
          try {
            const data = JSON.parse(event.data);
            onMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
      };
      
      return ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();