import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Bell, 
  RefreshCw,
  Zap,
  CircleDot,
  Settings,
  User,
  GitBranch,
  Activity
} from 'lucide-react';

const Header = () => {
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'myblog 프로젝트가 성공적으로 시작되었습니다.', time: '방금 전' },
    { id: 2, type: 'warning', message: 'ecommerce-app의 메모리 사용량이 높습니다.', time: '5분 전' },
    { id: 3, type: 'info', message: '새로운 템플릿이 추가되었습니다.', time: '1시간 전' },
  ]);

  const unreadCount = notifications.length;

  return (
    <div className="bg-background border-b border-border">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-dark">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                <CircleDot className="w-3 h-3 mr-1 fill-current" />
                시스템 온라인
              </Badge>
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                3개 프로젝트 활성
              </Badge>
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                <Activity className="w-3 h-3 mr-1" />
                정상 동작
              </Badge>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Project Isolator
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              포트 충돌 없는 React + Python 프로젝트 로컬 개발 플랫폼
            </p>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                새 프로젝트
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="h-4 w-4 mr-2" />
                전체 새로고침
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="프로젝트, 로그, 설정 검색..." 
                className="pl-10 w-80 bg-muted/50 border-border"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* System Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <Activity className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">시스템 정상</span>
            </div>

            {/* Git Branch Info */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <GitBranch className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">main</span>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-2">
                  <h3 className="font-semibold">알림</h3>
                  <Button variant="ghost" size="sm" className="text-xs">
                    모두 읽음
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                    <div className="flex w-full items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                      <Badge 
                        variant={
                          notification.type === 'success' ? 'default' :
                          notification.type === 'warning' ? 'destructive' : 'secondary'
                        }
                        className="ml-2"
                      >
                        {notification.type}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    새로운 알림이 없습니다
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  환경 설정
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Git 설정
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Zap className="mr-2 h-4 w-4" />
                  성능 모니터링
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  도움말
                </DropdownMenuItem>
                <DropdownMenuItem>
                  정보
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">개발자</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      dev@example.com
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  프로필 설정
                </DropdownMenuItem>
                <DropdownMenuItem>
                  워크스페이스 설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>마지막 업데이트:</span>
              <span className="text-foreground">2분 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;