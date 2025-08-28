import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ApiStatus {
  isOnline: boolean;
  latency: number | null;
  lastChecked: Date | null;
  error?: string;
}

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>({
    isOnline: true,
    latency: null,
    lastChecked: null,
  });

  const { data: healthData, error, isError } = useQuery({
    queryKey: ['/health/live'],
    queryFn: async () => {
      const start = Date.now();
      const response = await fetch('/health/live');
      const latency = Date.now() - start;
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      return { latency, data: await response.json() };
    },
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (healthData) {
      setStatus({
        isOnline: true,
        latency: healthData.latency,
        lastChecked: new Date(),
      });
    } else if (isError) {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Health check failed',
      }));
    }
  }, [healthData, isError, error]);

  return status;
}

export function ApiStatusIndicator() {
  const status = useApiStatus();

  if (!status.lastChecked) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium ${
          status.isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
        title={status.error || `Latency: ${status.latency}ms`}
      >
        <div 
          className={`w-2 h-2 rounded-full ${
            status.isOnline ? 'bg-green-500' : 'bg-red-500'
          }`} 
        />
        <span>
          {status.isOnline ? 'Online' : 'Offline'}
          {status.latency && ` • ${status.latency}ms`}
        </span>
      </div>
    </div>
  );
}