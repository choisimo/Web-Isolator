import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Trash, 
  Filter,
  Terminal,
  Server,
  Database,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { LogEntry } from '@/types/project';
import { useWebSocketLogs } from '@/hooks/useWebSocket';
import { useProjectLogs } from '@/hooks/useProject';

interface LogViewerProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

const LogViewer = ({ projectId, projectName, isOpen, onClose }: LogViewerProps) => {
  const [selectedService, setSelectedService] = useState<'frontend' | 'backend' | 'database'>('frontend');
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [useRealtime, setUseRealtime] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 실시간 WebSocket 로그
  const {
    logs: realtimeLogs,
    isConnected: wsConnected,
    error: wsError,
    clearLogs: clearRealtimeLogs
  } = useWebSocketLogs({
    projectId,
    service: selectedService,
    autoReconnect: true
  });

  // HTTP API 로그 (폴백)
  const {
    logs: httpLogs,
    isLoading: httpLoading,
    error: httpError,
    refetch: refetchHttpLogs
  } = useProjectLogs(projectId, selectedService);

  // 사용할 로그 데이터 결정
  const logs = useRealtime && wsConnected ? realtimeLogs : httpLogs;
  const isLoading = !useRealtime && httpLoading;
  const error = useRealtime ? wsError : httpError;

  useEffect(() => {
    let filtered = logs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by level
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, levelFilter]);

  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [filteredLogs, autoScroll]);

  // 서비스 변경 시 로그 새로고침
  useEffect(() => {
    if (!useRealtime) {
      refetchHttpLogs();
    }
  }, [selectedService, useRealtime, refetchHttpLogs]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'frontend': return <Terminal className="h-4 w-4 text-accent" />;
      case 'backend': return <Server className="h-4 w-4 text-primary" />;
      case 'database': return <Database className="h-4 w-4 text-warning" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'destructive';
      case 'info': return 'default';
      case 'debug': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}초 전`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}분 전`;
    } else {
      return date.toLocaleTimeString('ko-KR');
    }
  };

  const copyLogEntry = (log: LogEntry) => {
    const logText = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`;
    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-${selectedService}-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (useRealtime) {
      clearRealtimeLogs();
    } else {
      // HTTP 로그의 경우 서버에서 클리어 API 호출 필요
      console.log('Clear HTTP logs not implemented');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span>{projectName} - 로그 뷰어</span>
            {useRealtime && (
              wsConnected ? 
                <Wifi className="h-4 w-4 text-green-500" /> : 
                <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </DialogTitle>
          <DialogDescription>
            실시간 로그 스트림 및 히스토리를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Connection Status & Errors */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => {
                    if (!useRealtime) {
                      refetchHttpLogs();
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  다시 시도
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {useRealtime && !wsConnected && (
            <Alert className="bg-warning/10 border-warning">
              <WifiOff className="h-4 w-4" />
              <AlertDescription>
                실시간 연결이 끊어졌습니다. 자동으로 재연결을 시도하고 있습니다.
              </AlertDescription>
            </Alert>
          )}

          {/* Service Selection */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">서비스:</span>
              <Select value={selectedService} onValueChange={(value: any) => setSelectedService(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">프론트엔드</SelectItem>
                  <SelectItem value="backend">백엔드</SelectItem>
                  <SelectItem value="database">데이터베이스</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseRealtime(!useRealtime)}
              className={useRealtime ? 'bg-primary/10' : ''}
            >
              {useRealtime ? '실시간 모드' : 'HTTP 모드'}
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="로그 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 레벨</SelectItem>
                  <SelectItem value="error">에러</SelectItem>
                  <SelectItem value="warn">경고</SelectItem>
                  <SelectItem value="info">정보</SelectItem>
                  <SelectItem value="debug">디버그</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className={autoScroll ? 'bg-primary/10' : ''}
              >
                {autoScroll ? '자동 스크롤 ON' : '자동 스크롤 OFF'}
              </Button>
            </div>

            <div className="flex gap-2">
              {!useRealtime && (
                <Button variant="outline" size="sm" onClick={refetchHttpLogs} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash className="h-4 w-4 mr-2" />
                지우기
              </Button>
            </div>
          </div>

          {/* Log Statistics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <div className="text-sm text-muted-foreground">총 로그</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {filteredLogs.filter(l => l.level === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">에러</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {filteredLogs.filter(l => l.level === 'warn').length}
              </div>
              <div className="text-sm text-muted-foreground">경고</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {filteredLogs.filter(l => l.level === 'info').length}
              </div>
              <div className="text-sm text-muted-foreground">정보</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {filteredLogs.filter(l => l.level === 'debug').length}
              </div>
              <div className="text-sm text-muted-foreground">디버그</div>
            </div>
          </div>

          {/* Log Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>로그 엔트리 ({filteredLogs.length}개)</span>
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96" ref={scrollAreaRef}>
                <div className="space-y-1 p-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                      <p>로그를 불러오는 중...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>표시할 로그가 없습니다</p>
                      <p className="text-sm">필터를 조정하거나 로그가 생성될 때까지 기다려주세요</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="group flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                          <div className="flex items-center space-x-1">
                            {getLevelIcon(log.level)}
                            {getSourceIcon(log.source)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                              {log.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-mono break-all">{log.message}</p>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(log.timestamp)}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyLogEntry(log)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                메타데이터 보기
                              </summary>
                              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogViewer;

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'frontend': return <Terminal className="h-4 w-4 text-accent" />;
      case 'backend': return <Server className="h-4 w-4 text-primary" />;
      case 'database': return <Database className="h-4 w-4 text-warning" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'destructive';
      case 'info': return 'default';
      case 'debug': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return `${Math.floor(diff / 1000)}초 전`;
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}분 전`;
    } else {
      return date.toLocaleTimeString('ko-KR');
    }
  };

  const copyLogEntry = (log: LogEntry) => {
    const logText = `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`;
    navigator.clipboard.writeText(logText);
  };

  const downloadLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-logs-${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-primary" />
            <span>{projectName} - 로그 뷰어</span>
          </DialogTitle>
          <DialogDescription>
            실시간 로그 스트림 및 히스토리를 확인할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="로그 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 레벨</SelectItem>
                  <SelectItem value="error">에러</SelectItem>
                  <SelectItem value="warn">경고</SelectItem>
                  <SelectItem value="info">정보</SelectItem>
                  <SelectItem value="debug">디버그</SelectItem>
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 레벨</SelectItem>
                  <SelectItem value="error">에러</SelectItem>
                  <SelectItem value="warn">경고</SelectItem>
                  <SelectItem value="info">정보</SelectItem>
                  <SelectItem value="debug">디버그</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className={autoScroll ? 'bg-primary/10' : ''}
              >
                {autoScroll ? '자동 스크롤 ON' : '자동 스크롤 OFF'}
              </Button>
            </div>

            <div className="flex gap-2">
              {!useRealtime && (
                <Button variant="outline" size="sm" onClick={refetchHttpLogs} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  새로고침
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={downloadLogs}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash className="h-4 w-4 mr-2" />
                지우기
              </Button>
            </div>
          </div>

          {/* Log Statistics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredLogs.length}</div>
              <div className="text-sm text-muted-foreground">총 로그</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {filteredLogs.filter(l => l.level === 'error').length}
              </div>
              <div className="text-sm text-muted-foreground">에러</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">
                {filteredLogs.filter(l => l.level === 'warn').length}
              </div>
              <div className="text-sm text-muted-foreground">경고</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {filteredLogs.filter(l => l.level === 'info').length}
              </div>
              <div className="text-sm text-muted-foreground">정보</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {filteredLogs.filter(l => l.level === 'debug').length}
              </div>
              <div className="text-sm text-muted-foreground">디버그</div>
            </div>
          </div>

          {/* Log Entries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>로그 엔트리 ({filteredLogs.length}개)</span>
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96" ref={scrollAreaRef}>
                <div className="space-y-1 p-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin opacity-50" />
                      <p>로그를 불러오는 중...</p>
                    </div>
                  ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>표시할 로그가 없습니다</p>
                      <p className="text-sm">필터를 조정하거나 로그가 생성될 때까지 기다려주세요</p>
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="group flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                          <div className="flex items-center space-x-1">
                            {getLevelIcon(log.level)}
                            {getSourceIcon(log.source)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                              {log.level}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.source}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-mono break-all">{log.message}</p>
                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(log.timestamp)}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyLogEntry(log)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                메타데이터 보기
                              </summary>
                              <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogViewer;