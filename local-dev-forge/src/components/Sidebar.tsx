import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Settings, 
  FileText, 
  Terminal,
  Network,
  Container,
  Activity
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      current: activeTab === 'dashboard',
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: FolderPlus,
      current: activeTab === 'projects',
      badge: '3'
    },
    {
      id: 'nginx',
      name: 'Nginx Config',
      icon: Network,
      current: activeTab === 'nginx',
    },
    {
      id: 'docker',
      name: 'Docker',
      icon: Container,
      current: activeTab === 'docker',
    },
    {
      id: 'logs',
      name: 'Logs',
      icon: FileText,
      current: activeTab === 'logs',
    },
    {
      id: 'terminal',
      name: 'Terminal',
      icon: Terminal,
      current: activeTab === 'terminal',
    },
  ];

  const bottomNavigation = [
    {
      id: 'monitoring',
      name: 'Monitoring',
      icon: Activity,
      current: activeTab === 'monitoring',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      current: activeTab === 'settings',
    },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Network className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary">Web Isolator</h2>
            <p className="text-xs text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                item.current && "bg-primary/10 text-primary border border-primary/20"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.name}
              {item.badge && (
                <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-4 py-3 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">System Status</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-success">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Docker</span>
            <span className="text-success">Connected</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Nginx</span>
            <span className="text-success">Running</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 pb-4 space-y-1">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={item.current ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                item.current && "bg-primary/10 text-primary border border-primary/20"
              )}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;