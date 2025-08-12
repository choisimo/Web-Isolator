import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectTemplate } from '@/types/project';
import { Globe, Server, Database, Code, Package, Zap } from 'lucide-react';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

const ProjectCreateModal = ({ isOpen, onClose, onSubmit }: ProjectCreateModalProps) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [customPorts, setCustomPorts] = useState({
    frontend: 3000,
    backend: 8000,
    database: 5432
  });
  const [environment, setEnvironment] = useState('development');
  const [features, setFeatures] = useState({
    ssl: false,
    autoRestart: true,
    hotReload: true,
    watchFiles: true
  });

  const templates: ProjectTemplate[] = [
    {
      id: 'react-fastapi',
      name: 'React + FastAPI',
      description: 'React 프론트엔드와 FastAPI 백엔드를 사용하는 현대적인 풀스택 애플리케이션',
      category: 'fullstack',
      tags: ['react', 'fastapi', 'python', 'typescript'],
      frontend: {
        framework: 'React',
        version: '18.x',
        dependencies: ['vite', 'typescript', 'tailwindcss']
      },
      backend: {
        framework: 'FastAPI',
        version: '0.104.x',
        dependencies: ['uvicorn', 'pydantic', 'sqlalchemy']
      },
      database: {
        type: 'PostgreSQL',
        version: '15.x'
      },
      config: {
        defaultPorts: {
          frontend: 3000,
          backend: 8000,
          database: 5432
        },
        environment: {
          'DATABASE_URL': 'postgresql://user:password@localhost:5432/app',
          'JWT_SECRET': 'your-secret-key',
          'API_URL': 'http://localhost:8000'
        }
      }
    },
    {
      id: 'nextjs-django',
      name: 'Next.js + Django',
      description: 'Next.js와 Django를 사용한 SSR 지원 풀스택 애플리케이션',
      category: 'fullstack',
      tags: ['nextjs', 'django', 'python', 'react'],
      frontend: {
        framework: 'Next.js',
        version: '14.x',
        dependencies: ['typescript', 'tailwindcss', 'next-auth']
      },
      backend: {
        framework: 'Django',
        version: '4.2.x',
        dependencies: ['djangorestframework', 'django-cors-headers', 'celery']
      },
      database: {
        type: 'PostgreSQL',
        version: '15.x'
      },
      config: {
        defaultPorts: {
          frontend: 3001,
          backend: 8001,
          database: 5433
        },
        environment: {
          'DATABASE_URL': 'postgresql://user:password@localhost:5433/app',
          'SECRET_KEY': 'django-secret-key',
          'DEBUG': 'True'
        }
      }
    },
    {
      id: 'vue-flask',
      name: 'Vue.js + Flask',
      description: 'Vue.js 프론트엔드와 Flask 백엔드를 사용하는 경량 웹 애플리케이션',
      category: 'fullstack',
      tags: ['vue', 'flask', 'python', 'javascript'],
      frontend: {
        framework: 'Vue.js',
        version: '3.x',
        dependencies: ['vite', 'vue-router', 'pinia']
      },
      backend: {
        framework: 'Flask',
        version: '2.3.x',
        dependencies: ['flask-sqlalchemy', 'flask-migrate', 'flask-cors']
      },
      database: {
        type: 'SQLite',
        version: 'latest'
      },
      config: {
        defaultPorts: {
          frontend: 3002,
          backend: 8002
        },
        environment: {
          'DATABASE_URL': 'sqlite:///app.db',
          'SECRET_KEY': 'flask-secret-key',
          'FLASK_ENV': 'development'
        }
      }
    },
    {
      id: 'react-only',
      name: 'React SPA',
      description: 'React 기반 단일 페이지 애플리케이션 (프론트엔드 전용)',
      category: 'frontend',
      tags: ['react', 'spa', 'typescript'],
      frontend: {
        framework: 'React',
        version: '18.x',
        dependencies: ['vite', 'typescript', 'react-router-dom', 'tailwindcss']
      },
      config: {
        defaultPorts: {
          frontend: 3000
        },
        environment: {
          'VITE_API_URL': 'http://localhost:8000'
        }
      }
    },
    {
      id: 'fastapi-only',
      name: 'FastAPI API',
      description: 'FastAPI 기반 RESTful API 서버 (백엔드 전용)',
      category: 'backend',
      tags: ['fastapi', 'api', 'python'],
      backend: {
        framework: 'FastAPI',
        version: '0.104.x',
        dependencies: ['uvicorn', 'pydantic', 'sqlalchemy', 'alembic']
      },
      database: {
        type: 'PostgreSQL',
        version: '15.x'
      },
      config: {
        defaultPorts: {
          backend: 8000,
          database: 5432
        },
        environment: {
          'DATABASE_URL': 'postgresql://user:password@localhost:5432/api',
          'JWT_SECRET': 'your-secret-key'
        }
      }
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim() || !selectedTemplate) {
      return;
    }

    const projectData = {
      name: projectName.trim(),
      description: description.trim(),
      template: selectedTemplate,
      ports: customPorts,
      environment: {
        mode: environment,
        variables: selectedTemplate.config.environment
      },
      config: features
    };

    onSubmit(projectData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setSelectedTemplate(null);
    setCustomPorts({ frontend: 3000, backend: 8000, database: 5432 });
    setEnvironment('development');
    setFeatures({
      ssl: false,
      autoRestart: true,
      hotReload: true,
      watchFiles: true
    });
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    if (template.config.defaultPorts) {
      setCustomPorts({
        frontend: template.config.defaultPorts.frontend || 3000,
        backend: template.config.defaultPorts.backend || 8000,
        database: template.config.defaultPorts.database || 5432
      });
    }
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'fullstack': return <Package className="h-6 w-6" />;
      case 'frontend': return <Globe className="h-6 w-6" />;
      case 'backend': return <Server className="h-6 w-6" />;
      case 'database': return <Database className="h-6 w-6" />;
      default: return <Code className="h-6 w-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>새 프로젝트 생성</span>
          </DialogTitle>
          <DialogDescription>
            템플릿을 선택하고 프로젝트 설정을 구성하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">템플릿 선택</TabsTrigger>
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="ports">포트 설정</TabsTrigger>
              <TabsTrigger value="features">기능 설정</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">프로젝트 템플릿</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-secondary">
                            {getTemplateIcon(template.category)}
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {template.frontend && (
                            <div className="flex items-center space-x-2">
                              <Globe className="h-3 w-3" />
                              <span>{template.frontend.framework} {template.frontend.version}</span>
                            </div>
                          )}
                          {template.backend && (
                            <div className="flex items-center space-x-2">
                              <Server className="h-3 w-3" />
                              <span>{template.backend.framework} {template.backend.version}</span>
                            </div>
                          )}
                          {template.database && (
                            <div className="flex items-center space-x-2">
                              <Database className="h-3 w-3" />
                              <span>{template.database.type} {template.database.version}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">프로젝트 이름 *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="my-awesome-project"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment">환경</Label>
                  <Select value={environment} onValueChange={setEnvironment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">개발 (Development)</SelectItem>
                      <SelectItem value="staging">스테이징 (Staging)</SelectItem>
                      <SelectItem value="production">프로덕션 (Production)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ports" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">포트 설정</h3>
                
                {selectedTemplate?.frontend && (
                  <div className="space-y-2">
                    <Label htmlFor="frontendPort">프론트엔드 포트</Label>
                    <Input
                      id="frontendPort"
                      type="number"
                      value={customPorts.frontend}
                      onChange={(e) => setCustomPorts(prev => ({
                        ...prev,
                        frontend: parseInt(e.target.value) || 3000
                      }))}
                      min="1024"
                      max="65535"
                    />
                  </div>
                )}

                {selectedTemplate?.backend && (
                  <div className="space-y-2">
                    <Label htmlFor="backendPort">백엔드 포트</Label>
                    <Input
                      id="backendPort"
                      type="number"
                      value={customPorts.backend}
                      onChange={(e) => setCustomPorts(prev => ({
                        ...prev,
                        backend: parseInt(e.target.value) || 8000
                      }))}
                      min="1024"
                      max="65535"
                    />
                  </div>
                )}

                {selectedTemplate?.database && (
                  <div className="space-y-2">
                    <Label htmlFor="databasePort">데이터베이스 포트</Label>
                    <Input
                      id="databasePort"
                      type="number"
                      value={customPorts.database}
                      onChange={(e) => setCustomPorts(prev => ({
                        ...prev,
                        database: parseInt(e.target.value) || 5432
                      }))}
                      min="1024"
                      max="65535"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">기능 설정</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SSL 활성화</Label>
                      <p className="text-sm text-muted-foreground">HTTPS를 사용하여 보안 연결</p>
                    </div>
                    <Switch
                      checked={features.ssl}
                      onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, ssl: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>자동 재시작</Label>
                      <p className="text-sm text-muted-foreground">오류 발생 시 자동으로 프로세스 재시작</p>
                    </div>
                    <Switch
                      checked={features.autoRestart}
                      onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, autoRestart: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>핫 리로드</Label>
                      <p className="text-sm text-muted-foreground">코드 변경 시 자동으로 페이지 새로고침</p>
                    </div>
                    <Switch
                      checked={features.hotReload}
                      onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, hotReload: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>파일 감시</Label>
                      <p className="text-sm text-muted-foreground">파일 변경 사항 자동 감지</p>
                    </div>
                    <Switch
                      checked={features.watchFiles}
                      onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, watchFiles: checked }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-primary"
              disabled={!projectName.trim() || !selectedTemplate}
            >
              프로젝트 생성
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateModal;