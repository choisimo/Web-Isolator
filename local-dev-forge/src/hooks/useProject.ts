import { useState, useEffect, useCallback } from 'react';
import { Project, LogEntry, SystemStats } from '@/types/project';
import { projectService } from '@/services/projectService';

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  startProject: (id: string) => Promise<boolean>;
  stopProject: (id: string) => Promise<boolean>;
  restartProject: (id: string) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  createProject: (projectData: Partial<Project>) => Promise<Project | null>;
}

export function useProjects(): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await projectService.startProject(id);
      if (success) {
        await fetchProjects(); // 상태 업데이트를 위해 다시 가져오기
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start project');
      return false;
    }
  }, [fetchProjects]);

  const stopProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await projectService.stopProject(id);
      if (success) {
        await fetchProjects(); // 상태 업데이트를 위해 다시 가져오기
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop project');
      return false;
    }
  }, [fetchProjects]);

  const restartProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await projectService.restartProject(id);
      if (success) {
        await fetchProjects(); // 상태 업데이트를 위해 다시 가져오기
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart project');
      return false;
    }
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await projectService.deleteProject(id);
      if (success) {
        await fetchProjects(); // 목록 업데이트를 위해 다시 가져오기
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    }
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData: Partial<Project>): Promise<Project | null> => {
    try {
      setError(null);
      const newProject = await projectService.createProject(projectData);
      await fetchProjects(); // 목록 업데이트를 위해 다시 가져오기
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  }, [fetchProjects]);

  useEffect(() => {
    fetchProjects();

    // 프로젝트 변경사항 구독
    const unsubscribe = projectService.subscribe((updatedProjects) => {
      setProjects(updatedProjects);
    });

    return () => {
      unsubscribe();
    };
  }, [fetchProjects]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    startProject,
    stopProject,
    restartProject,
    deleteProject,
    createProject
  };
}

interface UseProjectResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProject(id: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedProject = await projectService.getProject(id);
      setProject(fetchedProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    refetch: fetchProject
  };
}

interface UseProjectLogsResult {
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjectLogs(
  projectId: string, 
  service: 'frontend' | 'backend' | 'database'
): UseProjectLogsResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!projectId || !service) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const fetchedLogs = await projectService.getProjectLogs(projectId, service);
      setLogs(fetchedLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, service]);

  useEffect(() => {
    fetchLogs();
    
    // 주기적으로 로그 업데이트 (실시간 로그를 위해)
    const interval = setInterval(fetchLogs, 2000);
    
    return () => clearInterval(interval);
  }, [fetchLogs]);

  return {
    logs,
    isLoading,
    error,
    refetch: fetchLogs
  };
}

interface UseSystemStatsResult {
  stats: SystemStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSystemStats(): UseSystemStatsResult {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedStats = await projectService.getSystemStats();
      setStats(fetchedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch system stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // 주기적으로 시스템 통계 업데이트
    const interval = setInterval(fetchStats, 5000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}