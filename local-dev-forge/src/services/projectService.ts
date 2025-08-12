import { Project, LogEntry, SystemStats } from '@/types/project';
import { apiClient } from '@/lib/apiClient';

class ProjectService {
  private projects: Project[] = [];
  private listeners: ((projects: Project[]) => void)[] = [];
  private wsConnection: WebSocket | null = null;
  private isUsingMockData: boolean = false;

  // Mock API endpoints (fallback for development)
  private mockProjects: Project[] = [
    {
      id: '1',
      name: 'myblog',
      description: '개인 블로그 프로젝트 - React + FastAPI',
      status: 'running',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:20:00Z',
      frontend: {
        url: 'http://myblog.local',
        port: 3000,
        status: 'running',
        framework: 'react',
        buildCommand: 'npm run build',
        startCommand: 'npm run dev'
      },
      backend: {
        url: 'http://api.myblog.local',
        port: 8000,
        status: 'running',
        framework: 'fastapi',
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'uvicorn main:app --reload'
      },
      database: {
        type: 'postgresql',
        status: 'running',
        port: 5432,
        connectionString: 'postgresql://user:password@localhost:5432/myblog'
      },
      environment: {
        mode: 'development',
        variables: {
          'DATABASE_URL': 'postgresql://user:password@localhost:5432/myblog',
          'JWT_SECRET': 'your-secret-key',
          'API_URL': 'http://api.myblog.local'
        }
      },
      resources: {
        cpu: { usage: 15.3, limit: 2 },
        memory: { usage: 512, limit: 2048 },
        disk: { usage: 1024, limit: 10240 }
      },
      logs: {
        frontend: [],
        backend: [],
        database: []
      },
      config: {
        autoRestart: true,
        watchFiles: true,
        hotReload: true,
        ssl: false
      }
    },
    {
      id: '2',
      name: 'ecommerce-app',
      description: '이커머스 플랫폼 - Next.js + Django',
      status: 'stopped',
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
      frontend: {
        url: 'http://ecommerce-app.local',
        port: 3001,
        status: 'stopped',
        framework: 'nextjs',
        buildCommand: 'npm run build',
        startCommand: 'npm run dev'
      },
      backend: {
        url: 'http://api.ecommerce-app.local',
        port: 8001,
        status: 'stopped',
        framework: 'django',
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'python manage.py runserver'
      },
      database: {
        type: 'postgresql',
        status: 'stopped',
        port: 5433
      },
      environment: {
        mode: 'development',
        variables: {
          'DATABASE_URL': 'postgresql://user:password@localhost:5433/ecommerce',
          'STRIPE_SECRET_KEY': 'sk_test_...',
          'REDIS_URL': 'redis://localhost:6379'
        }
      },
      resources: {
        cpu: { usage: 0, limit: 4 },
        memory: { usage: 0, limit: 4096 },
        disk: { usage: 2048, limit: 20480 }
      },
      logs: {
        frontend: [],
        backend: []
      },
      config: {
        autoRestart: false,
        watchFiles: true,
        hotReload: true,
        ssl: true
      }
    },
    {
      id: '3',
      name: 'analytics-dashboard',
      description: '데이터 분석 대시보드 - Vue.js + Flask',
      status: 'building',
      createdAt: '2024-01-22T11:00:00Z',
      updatedAt: '2024-01-22T15:30:00Z',
      frontend: {
        url: 'http://analytics-dashboard.local',
        port: 3002,
        status: 'building',
        framework: 'vue',
        buildCommand: 'npm run build',
        startCommand: 'npm run serve'
      },
      backend: {
        url: 'http://api.analytics-dashboard.local',
        port: 8002,
        status: 'running',
        framework: 'flask',
        buildCommand: 'pip install -r requirements.txt',
        startCommand: 'flask run'
      },
      database: {
        type: 'mongodb',
        status: 'running',
        port: 27017
      },
      environment: {
        mode: 'development',
        variables: {
          'MONGODB_URI': 'mongodb://localhost:27017/analytics',
          'FLASK_ENV': 'development',
          'SECRET_KEY': 'dev-secret-key'
        }
      },
      resources: {
        cpu: { usage: 45.7, limit: 2 },
        memory: { usage: 1024, limit: 3072 },
        disk: { usage: 1536, limit: 15360 }
      },
      logs: {
        frontend: [],
        backend: []
      },
      config: {
        autoRestart: true,
        watchFiles: true,
        hotReload: true,
        ssl: false
      }
    }
  ];

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    try {
      // 실제 API 서버 연결 시도
      const projects = await apiClient.getProjects();
      this.projects = projects;
      this.isUsingMockData = false;
      this.setupWebSocketConnection();
    } catch (error) {
      console.warn('Failed to connect to API server, using mock data:', error);
      this.isUsingMockData = true;
      this.projects = this.mockProjects;
    }
  }

  private setupWebSocketConnection() {
    if (this.isUsingMockData) return;

    this.wsConnection = apiClient.createWebSocket((data) => {
      this.handleWebSocketMessage(data);
    });
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'project_updated':
        this.updateProjectInList(data.project);
        break;
      case 'project_created':
        this.addProjectToList(data.project);
        break;
      case 'project_deleted':
        this.removeProjectFromList(data.projectId);
        break;
      case 'logs_updated':
        this.updateProjectLogs(data.projectId, data.service, data.logs);
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private updateProjectInList(updatedProject: Project) {
    const index = this.projects.findIndex(p => p.id === updatedProject.id);
    if (index !== -1) {
      this.projects[index] = updatedProject;
      this.notifyListeners();
    }
  }

  private addProjectToList(newProject: Project) {
    this.projects.push(newProject);
    this.notifyListeners();
  }

  private removeProjectFromList(projectId: string) {
    this.projects = this.projects.filter(p => p.id !== projectId);
    this.notifyListeners();
  }

  private updateProjectLogs(projectId: string, service: 'frontend' | 'backend' | 'database', logs: LogEntry[]) {
    const project = this.projects.find(p => p.id === projectId);
    if (project) {
      project.logs[service] = logs;
      this.notifyListeners();
    }
  }

  // 프로젝트 목록 조회
  async getProjects(): Promise<Project[]> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...this.projects]), 100);
      });
    }

    try {
      this.projects = await apiClient.getProjects();
      return [...this.projects];
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw error;
    }
  }

  // 특정 프로젝트 조회
  async getProject(id: string): Promise<Project | null> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const project = this.projects.find(p => p.id === id);
          resolve(project || null);
        }, 100);
      });
    }

    try {
      const project = await apiClient.getProject(id);
      return project;
    } catch (error) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  // 프로젝트 시작
  async startProject(id: string): Promise<boolean> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const projectIndex = this.projects.findIndex(p => p.id === id);
          if (projectIndex !== -1) {
            this.projects[projectIndex].status = 'starting';
            this.projects[projectIndex].frontend.status = 'starting';
            this.projects[projectIndex].backend.status = 'starting';
            this.notifyListeners();
            
            // 3초 후 running 상태로 변경
            setTimeout(() => {
              this.projects[projectIndex].status = 'running';
              this.projects[projectIndex].frontend.status = 'running';
              this.projects[projectIndex].backend.status = 'running';
              if (this.projects[projectIndex].database) {
                this.projects[projectIndex].database!.status = 'running';
              }
              this.notifyListeners();
            }, 3000);
            
            resolve(true);
          } else {
            resolve(false);
          }
        }, 100);
      });
    }

    try {
      const updatedProject = await apiClient.startProject(id);
      this.updateProjectInList(updatedProject);
      return true;
    } catch (error) {
      console.error('Failed to start project:', error);
      return false;
    }
  }

  // 프로젝트 중지
  async stopProject(id: string): Promise<boolean> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const projectIndex = this.projects.findIndex(p => p.id === id);
          if (projectIndex !== -1) {
            this.projects[projectIndex].status = 'stopping';
            this.notifyListeners();
            
            // 2초 후 stopped 상태로 변경
            setTimeout(() => {
              this.projects[projectIndex].status = 'stopped';
              this.projects[projectIndex].frontend.status = 'stopped';
              this.projects[projectIndex].backend.status = 'stopped';
              if (this.projects[projectIndex].database) {
                this.projects[projectIndex].database!.status = 'stopped';
              }
              this.notifyListeners();
            }, 2000);
            
            resolve(true);
          } else {
            resolve(false);
          }
        }, 100);
      });
    }

    try {
      const updatedProject = await apiClient.stopProject(id);
      this.updateProjectInList(updatedProject);
      return true;
    } catch (error) {
      console.error('Failed to stop project:', error);
      return false;
    }
  }

  // 프로젝트 재시작
  async restartProject(id: string): Promise<boolean> {
    if (this.isUsingMockData) {
      const stopped = await this.stopProject(id);
      if (stopped) {
        return new Promise((resolve) => {
          setTimeout(async () => {
            const started = await this.startProject(id);
            resolve(started);
          }, 1000);
        });
      }
      return false;
    }

    try {
      const updatedProject = await apiClient.restartProject(id);
      this.updateProjectInList(updatedProject);
      return true;
    } catch (error) {
      console.error('Failed to restart project:', error);
      return false;
    }
  }

  // 프로젝트 삭제
  async deleteProject(id: string): Promise<boolean> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const initialLength = this.projects.length;
          this.projects = this.projects.filter(p => p.id !== id);
          const deleted = this.projects.length < initialLength;
          if (deleted) {
            this.notifyListeners();
          }
          resolve(deleted);
        }, 100);
      });
    }

    try {
      await apiClient.deleteProject(id);
      this.removeProjectFromList(id);
      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  }

  // 새 프로젝트 생성
  async createProject(projectData: Partial<Project>): Promise<Project> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newProject: Project = {
            id: Date.now().toString(),
            name: projectData.name || 'new-project',
            description: projectData.description || '',
            status: 'stopped',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            frontend: {
              url: `http://${projectData.name}.local`,
              port: 3000,
              status: 'stopped',
              framework: 'react',
              buildCommand: 'npm run build',
              startCommand: 'npm run dev',
              ...projectData.frontend
            },
            backend: {
              url: `http://api.${projectData.name}.local`,
              port: 8000,
              status: 'stopped',
              framework: 'fastapi',
              buildCommand: 'pip install -r requirements.txt',
              startCommand: 'uvicorn main:app --reload',
              ...projectData.backend
            },
            environment: {
              mode: 'development',
              variables: {},
              ...projectData.environment
            },
            resources: {
              cpu: { usage: 0, limit: 2 },
              memory: { usage: 0, limit: 2048 },
              disk: { usage: 0, limit: 10240 },
              ...projectData.resources
            },
            logs: {
              frontend: [],
              backend: [],
              database: []
            },
            config: {
              autoRestart: true,
              watchFiles: true,
              hotReload: true,
              ssl: false,
              ...projectData.config
            },
            ...projectData
          };
          
          this.projects.push(newProject);
          this.notifyListeners();
          resolve(newProject);
        }, 200);
      });
    }

    try {
      const createRequest = {
        name: projectData.name || 'new-project',
        description: projectData.description || '',
        frontend: projectData.frontend,
        backend: projectData.backend,
        database: projectData.database,
        environment: projectData.environment
      };

      const newProject = await apiClient.createProject(createRequest);
      this.addProjectToList(newProject);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  // 프로젝트 로그 조회
  async getProjectLogs(id: string, service: 'frontend' | 'backend' | 'database'): Promise<LogEntry[]> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const project = this.projects.find(p => p.id === id);
          if (project) {
            resolve(project.logs[service] || []);
          } else {
            resolve([]);
          }
        }, 100);
      });
    }

    try {
      return await apiClient.getProjectLogs(id, service);
    } catch (error) {
      console.error('Failed to get project logs:', error);
      return [];
    }
  }

  // 시스템 통계 조회
  async getSystemStats(): Promise<SystemStats> {
    if (this.isUsingMockData) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const runningProjects = this.projects.filter(p => p.status === 'running');
          const stoppedProjects = this.projects.filter(p => p.status === 'stopped');
          const errorProjects = this.projects.filter(p => p.status === 'error');
          const buildingProjects = this.projects.filter(p => p.status === 'building');
          
          resolve({
            totalProjects: this.projects.length,
            runningProjects: runningProjects.length,
            stoppedProjects: stoppedProjects.length,
            errorProjects: errorProjects.length,
            buildingProjects: buildingProjects.length,
            systemResources: {
              cpu: {
                usage: 35.2,
                cores: 8
              },
              memory: {
                used: 8192,
                total: 16384,
                available: 8192
              },
              disk: {
                used: 102400,
                total: 512000,
                available: 409600
              }
            },
            networkPorts: {
              used: [3000, 3001, 8000, 8001, 5432, 5433],
              available: [3002, 3003, 8002, 8003, 5434, 5435],
              conflicts: []
            }
          });
        }, 100);
      });
    }

    try {
      return await apiClient.getSystemStats();
    } catch (error) {
      console.error('Failed to get system stats:', error);
      throw error;
    }
  }

  // 변경사항 리스너 등록
  subscribe(listener: (projects: Project[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.projects]));
  }

  // 웹소켓 연결 해제
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export const projectService = new ProjectService();