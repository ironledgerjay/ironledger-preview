import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ActivityData {
  action: string;
  page: string;
  details?: Record<string, any>;
  resourceId?: string;
}

export function useActivityLogger() {
  const { user } = useAuth();

  const logActivity = async (activityData: ActivityData) => {
    try {
      await fetch('/api/crm/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || null,
          userType: user?.role || 'guest',
          action: activityData.action,
          page: activityData.page,
          details: activityData.details || {},
          resourceId: activityData.resourceId || null,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  const logPageView = (pageName: string, details?: Record<string, any>) => {
    logActivity({
      action: 'page_view',
      page: pageName,
      details,
    });
  };

  const logUserAction = (action: string, pageName: string, details?: Record<string, any>, resourceId?: string) => {
    logActivity({
      action,
      page: pageName,
      details,
      resourceId,
    });
  };

  return { logActivity, logPageView, logUserAction };
}

// Custom hook to automatically log page views
export function usePageTracking(pageName: string, dependencies: any[] = []) {
  const { logPageView } = useActivityLogger();

  useEffect(() => {
    logPageView(pageName, {
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
    });
  }, dependencies);
}