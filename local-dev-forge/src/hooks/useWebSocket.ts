import { useState, useEffect, useCallback, useRef } from 'react';
import { LogEntry } from '@/types/project';

interface UseWebSocketLogsOptions {
  projectId: string;
  service: 'frontend' | 'backend' | 'database';
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

interface UseWebSocketLogsResult {
  logs: LogEntry[];
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearLogs: () => void;
}

export function useWebSocketLogs({
  projectId,
  service,
  autoReconnect = true,
  reconnectDelay = 3000
}: UseWebSocketLogsOptions): UseWebSocketLogsResult {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(autoReconnect);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // 이미 연결됨
    }

    try {
      const url = `${wsUrl}/logs/${projectId}/${service}`;
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${projectId}/${service}`);
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'log_entry') {
            const logEntry: LogEntry = data.payload;
            setLogs(prev => [...prev, logEntry]);
          } else if (data.type === 'logs_batch') {
            const logEntries: LogEntry[] = data.payload;
            setLogs(prev => [...prev, ...logEntries]);
          } else if (data.type === 'logs_clear') {
            setLogs([]);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // 자동 재연결
        if (shouldReconnectRef.current && !event.wasClean) {
          console.log(`Attempting to reconnect in ${reconnectDelay}ms...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [projectId, service, wsUrl, reconnectDelay]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = autoReconnect;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, autoReconnect]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    logs,
    isConnected,
    error,
    connect,
    disconnect,
    clearLogs
  };
}

interface UseRealtimeProjectUpdatesOptions {
  onProjectUpdate?: (project: any) => void;
  onProjectCreated?: (project: any) => void;
  onProjectDeleted?: (projectId: string) => void;
}

interface UseRealtimeProjectUpdatesResult {
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useRealtimeProjectUpdates({
  onProjectUpdate,
  onProjectCreated,
  onProjectDeleted
}: UseRealtimeProjectUpdatesOptions = {}): UseRealtimeProjectUpdatesResult {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(true);

  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // 이미 연결됨
    }

    try {
      const url = `${wsUrl}/projects`;
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('Project updates WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'project_updated':
              onProjectUpdate?.(data.payload);
              break;
            case 'project_created':
              onProjectCreated?.(data.payload);
              break;
            case 'project_deleted':
              onProjectDeleted?.(data.payload.projectId);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('Project updates WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.onclose = (event) => {
        console.log('Project updates WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // 자동 재연결
        if (shouldReconnectRef.current && !event.wasClean) {
          setTimeout(() => {
            connect();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [wsUrl, onProjectUpdate, onProjectCreated, onProjectDeleted]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect
  };
}