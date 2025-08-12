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