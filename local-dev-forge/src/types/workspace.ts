// Web Isolator 2.0 Types for workspace management

export interface WorkspaceV2 {
  id: string;
  name: string;
  description?: string;
  version: string; // "2.0"
  projects: ProjectV2[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectV2 {
  id: string;
  name: string;
  path: string;
  provider: 'docker' | 'vm';
  status: 'running' | 'stopped' | 'error' | 'building' | 'starting' | 'stopping';
  services: ServiceV2[];
  networks: NetworkV2[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceV2 {
  id: string;
  name: string;
  type: 'react' | 'fastapi' | 'postgresql' | 'redis' | 'nginx' | 'custom';
  port?: number;
  image?: string;
  dockerfile_path?: string;
  command?: string;
  environment: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface NetworkV2 {
  id: string;
  name: string;
  driver: 'bridge' | 'host' | 'overlay';
  subnet?: string;
}

export interface EnvironmentVariable {
  id: string;
  serviceId: string;
  key: string;
  value: string;
  isSecret: boolean;
}

// Workspace JSON Schema (for import/export)
export interface WorkspaceSchema {
  version: "2.0";
  workspace: {
    id?: string;
    name: string;
    description?: string;
    projects: {
      id?: string;
      name: string;
      path: string;
      provider: 'docker' | 'vm';
      services: {
        name: string;
        type: string;
        port?: number;
        image?: string;
        dockerfile_path?: string;
        command?: string;
        environment: Record<string, string>;
      }[];
      networks: {
        name: string;
        driver: string;
        subnet?: string;
      }[];
      metadata?: Record<string, any>;
    }[];
    created_at?: string;
    updated_at?: string;
  };
}

// API Response types
export interface WorkspaceListResponse {
  workspaces: WorkspaceV2[];
}

export interface ProjectListResponse {
  projects: ProjectV2[];
}

export interface ServiceListResponse {
  services: ServiceV2[];
}

// Import/Export types
export interface WorkspaceImportRequest {
  workspaceData: WorkspaceSchema;
  overwrite?: boolean;
}

export interface WorkspaceImportResponse {
  workspaceId: string;
  projectCount: number;
  message: string;
}

export interface WorkspaceExportRequest {
  workspaceId?: string;
  includeSecrets?: boolean;
}

export interface WorkspaceExportResponse {
  workspaceData: WorkspaceSchema;
  filename: string;
}

// Legacy Project interface (for backward compatibility)
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'stopped' | 'error' | 'building' | 'starting' | 'stopping';
  createdAt: string;
  updatedAt: string;
  
  frontend: {
    url: string;
    port: number;
    status: 'running' | 'stopped' | 'error' | 'building' | 'starting';
    framework: 'react' | 'nextjs' | 'vue' | 'angular';
    buildCommand?: string;
    startCommand?: string;
  };
  
  backend: {
    url: string;
    port: number;
    status: 'running' | 'stopped' | 'error' | 'building' | 'starting';
    framework: 'fastapi' | 'flask' | 'django' | 'express' | 'nestjs';
    buildCommand?: string;
    startCommand?: string;
  };
  
  database?: {
    type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
    status: 'running' | 'stopped' | 'error';
    port?: number;
    connectionString?: string;
  };
  
  environment: {
    mode: 'development' | 'staging' | 'production';
    variables: Record<string, string>;
  };
  
  resources: {
    cpu: {
      usage: number; // percentage
      limit?: number; // cores
    };
    memory: {
      usage: number; // MB
      limit?: number; // MB
    };
    disk: {
      usage: number; // MB
      limit?: number; // MB
    };
  };
  
  logs: {
    frontend: LogEntry[];
    backend: LogEntry[];
    database?: LogEntry[];
  };
  
  config: {
    autoRestart: boolean;
    watchFiles: boolean;
    hotReload: boolean;
    ssl: boolean;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface SystemStats {
  totalProjects: number;
  runningProjects: number;
  stoppedProjects: number;
  errorProjects: number;
  buildingProjects: number;
  
  systemResources: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      used: number;
      total: number;
      available: number;
    };
    disk: {
      used: number;
      total: number;
      available: number;
    };
  };
  
  networkPorts: {
    used: number[];
    available: number[];
    conflicts: { port: number; projects: string[] }[];
  };
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fullstack' | 'frontend' | 'backend' | 'database';
  tags: string[];
  frontend?: {
    framework: string;
    version: string;
    dependencies: string[];
  };
  backend?: {
    framework: string;
    version: string;
    dependencies: string[];
  };
  database?: {
    type: string;
    version: string;
  };
  config: {
    defaultPorts: {
      frontend?: number;
      backend?: number;
      database?: number;
    };
    environment: Record<string, string>;
  };
}