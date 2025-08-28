import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Shield, 
  Database, 
  Zap, 
  Monitor,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { ApiStatusIndicator } from '@/hooks/useApiStatus';

interface HealthData {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'up' | 'down'; responseTime?: number; error?: string };
    payfast: { status: 'up' | 'down' | 'unknown'; error?: string };
    memory: { used: number; total: number; percentage: number };
    api: {
      totalRequests: number;
      requestsLastHour: number;
      requestsLast24Hours: number;
      averageResponseTime: number;
      errorRate: number;
    };
  };
}

export function SystemHealthDashboard() {
  const { data: health, isLoading, error } = useQuery<HealthData>({
    queryKey: ['/health'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <XCircle className="w-5 h-5" />
            <span>System Health - Unavailable</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Unable to fetch system health data</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'unhealthy':
      case 'down':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Monitor className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unhealthy':
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>System Health</span>
            </div>
            <Badge className={`${getStatusColor(health.status)} border`}>
              {getStatusIcon(health.status)}
              <span className="ml-2 capitalize">{health.status}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{health.version}</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {Math.floor(health.uptime / 3600)}h
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {health.checks.api.requestsLastHour}
              </div>
              <div className="text-sm text-gray-600">Requests/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {health.checks.api.averageResponseTime}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Database */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Database</span>
              </div>
              {getStatusIcon(health.checks.database.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  health.checks.database.status === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {health.checks.database.status}
                </span>
              </div>
              {health.checks.database.responseTime && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Response Time:</span>
                  <span className="text-sm font-medium">{health.checks.database.responseTime}ms</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PayFast */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>PayFast</span>
              </div>
              {getStatusIcon(health.checks.payfast.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  health.checks.payfast.status === 'up' ? 'text-green-600' : 
                  health.checks.payfast.status === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {health.checks.payfast.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Integration:</span>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Memory</span>
              </div>
              {health.checks.memory.percentage > 90 ? 
                <AlertTriangle className="w-4 h-4 text-yellow-600" /> :
                <CheckCircle className="w-4 h-4 text-green-600" />
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Used:</span>
                <span className="text-sm font-medium">{health.checks.memory.used}MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usage:</span>
                <span className="text-sm font-medium">{health.checks.memory.percentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Status Indicator */}
      <ApiStatusIndicator />
    </div>
  );
}

export function ProductionReadinessChecklist() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const checklistItems = [
    { id: 'env-vars', label: 'Environment variables configured', critical: true },
    { id: 'database', label: 'Database connected and migrated', critical: true },
    { id: 'payfast', label: 'PayFast integration tested', critical: true },
    { id: 'ssl', label: 'SSL certificates configured', critical: true },
    { id: 'monitoring', label: 'Health checks implemented', critical: false },
    { id: 'logging', label: 'Request logging enabled', critical: false },
    { id: 'rate-limiting', label: 'Rate limiting configured', critical: false },
    { id: 'error-handling', label: 'Error boundaries implemented', critical: false },
    { id: 'security', label: 'Security headers configured', critical: false },
    { id: 'cors', label: 'CORS properly configured', critical: false },
  ];

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const criticalCount = checklistItems.filter(item => item.critical).length;
  const criticalChecked = checklistItems.filter(item => item.critical && checkedItems.has(item.id)).length;
  const totalChecked = checkedItems.size;
  const totalItems = checklistItems.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Production Readiness</span>
          <div className="flex space-x-2">
            <Badge variant="outline">
              Critical: {criticalChecked}/{criticalCount}
            </Badge>
            <Badge variant="outline">
              Total: {totalChecked}/{totalItems}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className={`p-1 h-auto ${checkedItems.has(item.id) ? 'text-green-600' : 'text-gray-400'}`}
                onClick={() => toggleCheck(item.id)}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <span className={`flex-1 ${checkedItems.has(item.id) ? 'line-through text-gray-500' : ''}`}>
                {item.label}
              </span>
              {item.critical && (
                <Badge variant="destructive" className="text-xs">
                  Critical
                </Badge>
              )}
            </div>
          ))}
        </div>
        
        {criticalChecked === criticalCount && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Ready for Production!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All critical requirements are met. Your application is ready for deployment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}