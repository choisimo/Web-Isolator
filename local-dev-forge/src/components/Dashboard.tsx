import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ExternalLink, 
  Terminal, 
  Database, 
  Globe, 
  Cpu, 
  HardDrive, 
  Activity,
  Settings,
  FileText,
  Plus,
  Trash2,
  Monitor,
  Server,
  Zap,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

import { useProjects, useSystemStats } from '@/hooks/useProject';
import { useRealtimeProjectUpdates } from '@/hooks/useWebSocket';
import ProjectCreateModal from './ProjectCreateModal';

const Dashboard = () => {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
    startProject,
    stopProject,
    restartProject,
    deleteProject
  } = useProjects();

  const {
    stats: systemStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useSystemStats();

  // 실시간 프로젝트 업데이트 구독
  const { isConnected: wsConnected } = useRealtimeProjectUpdates({
    onProjectUpdate: () => {
      refetchProjects();
      refetchStats();
    },
    onProjectCreated: () => {
      refetchProjects();
      refetchStats();
      toast({
        title: "새 프로젝트가 생성되었습니다",
        description: "프로젝트 목록이 업데이트되었습니다."
      });
    },
    onProjectDeleted: () => {
      refetchProjects();
      refetchStats();
      toast({
        title: "프로젝트가 삭제되었습니다",
        description: "프로젝트 목록이 업데이트되었습니다."
      });
    }
  });

  const handleStartProject = async (id: string) => {
    const success = await startProject(id);
    if (success) {
      toast({
        title: "프로젝트 시작",
        description: "프로젝트가 시작되고 있습니다..."
      });
    } else {
      toast({
        title: "프로젝트 시작 실패",
        description: "프로젝트를 시작할 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  const handleStopProject = async (id: string) => {
    const success = await stopProject(id);
    if (success) {
      toast({
        title: "프로젝트 중지",
        description: "프로젝트가 중지되고 있습니다..."
      });
    } else {
      toast({
        title: "프로젝트 중지 실패",
        description: "프로젝트를 중지할 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  const handleRestartProject = async (id: string) => {
    const success = await restartProject(id);
    if (success) {
      toast({
        title: "프로젝트 재시작",
        description: "프로젝트가 재시작되고 있습니다..."
      });
    } else {
      toast({
        title: "프로젝트 재시작 실패",
        description: "프로젝트를 재시작할 수 없습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('이 프로젝트를 삭제하시겠습니까?')) {
      const success = await deleteProject(id);
      if (success) {
        toast({
          title: "프로젝트 삭제",
          description: "프로젝트가 삭제되었습니다."
        });
      } else {
        toast({
          title: "프로젝트 삭제 실패",
          description: "프로젝트를 삭제할 수 없습니다.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStartAllProjects = async () => {
    const stoppedProjects = projects.filter(p => p.status === 'stopped');
    for (const project of stoppedProjects) {
      await startProject(project.id);
    }
    toast({
      title: "모든 프로젝트 시작",
      description: `${stoppedProjects.length}개의 프로젝트가 시작되고 있습니다.`
    });
  };

  const handleStopAllProjects = async () => {
    const runningProjects = projects.filter(p => p.status === 'running');
    for (const project of runningProjects) {
      await stopProject(project.id);
    }
    toast({
      title: "모든 프로젝트 중지",
      description: `${runningProjects.length}개의 프로젝트가 중지되고 있습니다.`
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running': return 'running';
      case 'stopped': return 'stopped';
      case 'error': return 'error';
      case 'building': 
      case 'starting':
      case 'stopping': return 'building';
      default: return 'default';
    }
  };

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'react':
      case 'nextjs':
      case 'vue':
      case 'angular':
        return <Globe className="h-4 w-4" />;
      case 'fastapi':
      case 'flask':
      case 'django':
      case 'express':
      case 'nestjs':
        return <Server className="h-4 w-4" />;
      default:
        return <Terminal className="h-4 w-4" />;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (projectsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!wsConnected && (
        <Alert className="bg-warning/10 border-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            실시간 연결이 끊어졌습니다. 자동으로 재연결을 시도하고 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Messages */}
      {(projectsError || statsError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {projectsError || statsError}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => {
                refetchProjects();
                refetchStats();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              다시 시도
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* System Stats Overview */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-dark border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 프로젝트</CardTitle>
              <Terminal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{systemStats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                활성: {systemStats.runningProjects} / 중지: {systemStats.stoppedProjects}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-dark border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU 사용률</CardTitle>
              <Cpu className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {systemStats.systemResources.cpu.usage}%
              </div>
              <Progress value={systemStats.systemResources.cpu.usage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {systemStats.systemResources.cpu.cores} 코어
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-dark border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">메모리 사용률</CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {Math.round((systemStats.systemResources.memory.used / systemStats.systemResources.memory.total) * 100)}%
              </div>
              <Progress 
                value={(systemStats.systemResources.memory.used / systemStats.systemResources.memory.total) * 100} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(systemStats.systemResources.memory.used * 1024 * 1024)} / {formatBytes(systemStats.systemResources.memory.total * 1024 * 1024)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-dark border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">디스크 사용률</CardTitle>
              <HardDrive className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {Math.round((systemStats.systemResources.disk.used / systemStats.systemResources.disk.total) * 100)}%
              </div>
              <Progress 
                value={(systemStats.systemResources.disk.used / systemStats.systemResources.disk.total) * 100} 
                className="mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formatBytes(systemStats.systemResources.disk.used * 1024 * 1024)} / {formatBytes(systemStats.systemResources.disk.total * 1024 * 1024)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            className="bg-gradient-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            새 프로젝트
          </Button>
          <Button 
            variant="outline"
            onClick={handleStartAllProjects}
            disabled={projects.filter(p => p.status === 'stopped').length === 0}
          >
            <Monitor className="h-4 w-4 mr-2" />
            모두 시작
          </Button>
          <Button 
            variant="outline"
            onClick={handleStopAllProjects}
            disabled={projects.filter(p => p.status === 'running').length === 0}
          >
            <Square className="h-4 w-4 mr-2" />
            모두 중지
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              refetchProjects();
              refetchStats();
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            className={`bg-card border-border shadow-elevated transition-all duration-200 hover:shadow-lg ${
              selectedProject === project.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                    <span>{project.name}</span>
                    {project.config.ssl && <Zap className="h-4 w-4 text-accent" />}
                  </CardTitle>
                  <CardDescription>{project.description || '로컬 개발 환경'}</CardDescription>
                </div>
                <StatusBadge variant={getStatusVariant(project.status)}>
                  {project.status}
                </StatusBadge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Tabs defaultValue="services" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="services">서비스</TabsTrigger>
                  <TabsTrigger value="resources">리소스</TabsTrigger>
                  <TabsTrigger value="config">설정</TabsTrigger>
                </TabsList>
                
                <TabsContent value="services" className="space-y-3 mt-4">
                  {/* Frontend Service */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center space-x-3">
                      {getFrameworkIcon(project.frontend.framework)}
                      <div>
                        <p className="text-sm font-medium">프론트엔드</p>
                        <p className="text-xs text-muted-foreground">
                          {project.frontend.framework.toUpperCase()} (포트 {project.frontend.port})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge variant={getStatusVariant(project.frontend.status)} size="sm" />
                      {project.frontend.status === 'running' && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Backend Service */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center space-x-3">
                      {getFrameworkIcon(project.backend.framework)}
                      <div>
                        <p className="text-sm font-medium">백엔드</p>
                        <p className="text-xs text-muted-foreground">
                          {project.backend.framework.toUpperCase()} (포트 {project.backend.port})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge variant={getStatusVariant(project.backend.status)} size="sm" />
                      {project.backend.status === 'running' && (
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Database Service */}
                  {project.database && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center space-x-3">
                        <Database className="h-4 w-4 text-warning" />
                        <div>
                          <p className="text-sm font-medium">데이터베이스</p>
                          <p className="text-xs text-muted-foreground">
                            {project.database.type.toUpperCase()} 
                            {project.database.port && ` (포트 ${project.database.port})`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge variant={getStatusVariant(project.database.status)} size="sm" />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="resources" className="space-y-3 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-accent" />
                        <span className="text-sm">CPU</span>
                      </div>
                      <span className="text-sm font-medium">{project.resources.cpu.usage}%</span>
                    </div>
                    <Progress value={project.resources.cpu.usage} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-warning" />
                        <span className="text-sm">메모리</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatBytes(project.resources.memory.usage * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress 
                      value={(project.resources.memory.usage / (project.resources.memory.limit || 2048)) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-success" />
                        <span className="text-sm">디스크</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatBytes(project.resources.disk.usage * 1024 * 1024)}
                      </span>
                    </div>
                    <Progress 
                      value={(project.resources.disk.usage / (project.resources.disk.limit || 10240)) * 100} 
                      className="h-2" 
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="config" className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">자동 재시작</span>
                      <Badge variant={project.config.autoRestart ? "default" : "secondary"}>
                        {project.config.autoRestart ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">파일 감시</span>
                      <Badge variant={project.config.watchFiles ? "default" : "secondary"}>
                        {project.config.watchFiles ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">핫 리로드</span>
                      <Badge variant={project.config.hotReload ? "default" : "secondary"}>
                        {project.config.hotReload ? "ON" : "OFF"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SSL</span>
                      <Badge variant={project.config.ssl ? "default" : "secondary"}>
                        {project.config.ssl ? "ON" : "OFF"}
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      환경: {project.environment.mode}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                {project.status === 'running' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopProject(project.id);
                    }}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    중지
                  </Button>
                ) : project.status === 'stopped' || project.status === 'error' ? (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1 bg-gradient-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartProject(project.id);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    시작
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="flex-1" disabled>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    {project.status}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRestartProject(project.id);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    // 설정 모달 열기
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">프로젝트가 없습니다</h3>
            <p className="text-muted-foreground text-center mb-4">
              새 프로젝트를 생성하여 개발을 시작하세요
            </p>
            <Button 
              className="bg-gradient-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 프로젝트 생성
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <ProjectCreateModal 
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onProjectCreated={(project) => {
          refetchProjects();
          refetchStats();
          toast({
            title: "프로젝트 생성 완료",
            description: `${project.name} 프로젝트가 생성되었습니다.`
          });
        }}
      />
    </div>
  );
};

export default Dashboard;