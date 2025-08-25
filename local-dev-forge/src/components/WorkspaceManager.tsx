import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Folder,
  Database,
  Server,
  Globe,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkspaceSchema, WorkspaceV2, ProjectV2, ServiceV2 } from '@/types/workspace';

interface WorkspaceManagerProps {
  workspaces: WorkspaceV2[];
  onWorkspaceImport: (workspaceData: WorkspaceSchema) => Promise<void>;
  onWorkspaceExport: (workspaceId?: string, includeSecrets?: boolean) => Promise<WorkspaceSchema>;
  onRefresh: () => void;
}

export function WorkspaceManager({ workspaces, onWorkspaceImport, onWorkspaceExport, onRefresh }: WorkspaceManagerProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceV2 | null>(null);
  const [workspaceJson, setWorkspaceJson] = useState('');
  const [includeSecrets, setIncludeSecrets] = useState(false);
  const [isValidJson, setIsValidJson] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.name.endsWith('.json'));
    
    if (jsonFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setWorkspaceJson(content);
        validateWorkspaceJson(content);
        setIsImportDialogOpen(true);
      };
      reader.readAsText(jsonFile);
    } else {
      toast({
        title: "잘못된 파일 형식",
        description: "workspace.json 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setWorkspaceJson(content);
        validateWorkspaceJson(content);
        setIsImportDialogOpen(true);
      };
      reader.readAsText(file);
    }
  }, []);

  const validateWorkspaceJson = (jsonContent: string) => {
    try {
      const parsed = JSON.parse(jsonContent);
      
      // Basic schema validation
      if (!parsed.version || parsed.version !== "2.0") {
        setIsValidJson(false);
        setValidationMessage("지원되지 않는 스키마 버전입니다. 버전 2.0이 필요합니다.");
        return;
      }
      
      if (!parsed.workspace || !parsed.workspace.name) {
        setIsValidJson(false);
        setValidationMessage("워크스페이스 이름이 필요합니다.");
        return;
      }
      
      if (!Array.isArray(parsed.workspace.projects)) {
        setIsValidJson(false);
        setValidationMessage("프로젝트 배열이 필요합니다.");
        return;
      }
      
      setIsValidJson(true);
      setValidationMessage(`유효한 워크스페이스 파일입니다. 프로젝트 ${parsed.workspace.projects.length}개가 포함되어 있습니다.`);
    } catch (error) {
      setIsValidJson(false);
      setValidationMessage("유효하지 않은 JSON 형식입니다.");
    }
  };

  const handleImport = async () => {
    if (!isValidJson || !workspaceJson) return;
    
    setIsProcessing(true);
    try {
      const workspaceData = JSON.parse(workspaceJson) as WorkspaceSchema;
      await onWorkspaceImport(workspaceData);
      
      toast({
        title: "워크스페이스 가져오기 완료",
        description: `"${workspaceData.workspace.name}" 워크스페이스를 성공적으로 가져왔습니다.`,
      });
      
      setIsImportDialogOpen(false);
      setWorkspaceJson('');
      onRefresh();
    } catch (error) {
      toast({
        title: "가져오기 실패",
        description: error instanceof Error ? error.message : "워크스페이스 가져오기에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (workspace?: WorkspaceV2) => {
    setIsProcessing(true);
    try {
      const workspaceData = await onWorkspaceExport(workspace?.id, includeSecrets);
      
      // Download as file
      const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workspaceData.workspace.name.replace(/[^a-zA-Z0-9]/g, '-')}-workspace.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "워크스페이스 내보내기 완료",
        description: `"${workspaceData.workspace.name}" 워크스페이스를 내보냈습니다.`,
      });
      
      setIsExportDialogOpen(false);
      setSelectedWorkspace(null);
    } catch (error) {
      toast({
        title: "내보내기 실패",
        description: error instanceof Error ? error.message : "워크스페이스 내보내기에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'react':
      case 'nextjs':
      case 'vue':
        return <Globe className="h-4 w-4" />;
      case 'fastapi':
      case 'flask':
      case 'django':
        return <Server className="h-4 w-4" />;
      case 'postgresql':
      case 'mysql':
      case 'mongodb':
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">워크스페이스 관리</h2>
          <p className="text-muted-foreground">
            개발 환경을 workspace.json 파일로 내보내거나 가져올 수 있습니다.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>가져오기</span>
          </Button>
          <Button 
            onClick={() => setIsExportDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>내보내기</span>
          </Button>
        </div>
      </div>

      {/* Drop Zone */}
      <Card
        className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">workspace.json 파일 드롭</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            워크스페이스 파일을 여기에 드래그하거나 버튼을 클릭하여 업로드하세요
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            파일 선택
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Workspaces List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{workspace.name}</CardTitle>
                <Badge variant="secondary">{workspace.projects.length}개 프로젝트</Badge>
              </div>
              <CardDescription>
                {workspace.description || '설명 없음'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workspace.projects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center space-x-2 text-sm">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{project.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {project.provider}
                    </Badge>
                  </div>
                ))}
                {workspace.projects.length > 3 && (
                  <div className="text-sm text-muted-foreground">
                    +{workspace.projects.length - 3}개 더...
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedWorkspace(workspace);
                  setIsExportDialogOpen(true);
                }}
                className="flex items-center space-x-1"
              >
                <Download className="h-3 w-3" />
                <span>내보내기</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {workspaces.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Folder className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">워크스페이스가 없습니다</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              새 프로젝트를 생성하거나 기존 워크스페이스를 가져와 보세요
            </p>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              워크스페이스 가져오기
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>워크스페이스 가져오기</DialogTitle>
            <DialogDescription>
              workspace.json 파일의 내용을 확인하고 가져오세요
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="workspace-json">Workspace JSON</Label>
              <Textarea
                id="workspace-json"
                value={workspaceJson}
                onChange={(e) => {
                  setWorkspaceJson(e.target.value);
                  validateWorkspaceJson(e.target.value);
                }}
                placeholder="워크스페이스 JSON을 여기에 붙여넣으세요..."
                rows={12}
                className="font-mono text-xs"
              />
            </div>
            
            {validationMessage && (
              <Alert variant={isValidJson ? "default" : "destructive"}>
                {isValidJson ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!isValidJson || isProcessing}
            >
              {isProcessing ? "가져오는 중..." : "가져오기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>워크스페이스 내보내기</DialogTitle>
            <DialogDescription>
              {selectedWorkspace 
                ? `"${selectedWorkspace.name}" 워크스페이스를 내보냅니다`
                : "모든 워크스페이스를 내보냅니다"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-secrets"
                checked={includeSecrets}
                onChange={(e) => setIncludeSecrets(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="include-secrets">비밀값 포함 (권장하지 않음)</Label>
            </div>
            
            {includeSecrets && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  비밀값을 포함하면 보안에 위험할 수 있습니다. 
                  파일을 안전하게 관리하고 공유하지 마세요.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              취소
            </Button>
            <Button 
              onClick={() => handleExport(selectedWorkspace || undefined)}
              disabled={isProcessing}
            >
              {isProcessing ? "내보내는 중..." : "내보내기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}