import { Request, Response, NextFunction } from 'express';

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
  duration: number;
  statusCode: number;
  error?: string;
}

const logs: LogEntry[] = [];

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: BufferEncoding) {
    const duration = Date.now() - startTime;
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      userId: (req as any).user?.id,
      duration,
      statusCode: res.statusCode
    };

    // Add error if status indicates failure
    if (res.statusCode >= 400) {
      logEntry.error = `HTTP ${res.statusCode}`;
    }

    logs.push(logEntry);
    
    // Keep only last 1000 entries in memory
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    console.log(`${req.method} ${req.url} ${res.statusCode} in ${duration}ms`);
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

export const getLogs = (limit = 100) => {
  return logs.slice(-limit).reverse();
};

export const getLogStats = () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const recentLogs = logs.filter(log => 
    new Date(log.timestamp).getTime() > oneHourAgo
  );
  
  const dailyLogs = logs.filter(log => 
    new Date(log.timestamp).getTime() > oneDayAgo
  );

  return {
    totalRequests: logs.length,
    requestsLastHour: recentLogs.length,
    requestsLast24Hours: dailyLogs.length,
    averageResponseTime: logs.length > 0 
      ? Math.round(logs.reduce((sum, log) => sum + log.duration, 0) / logs.length)
      : 0,
    errorRate: logs.length > 0 
      ? Math.round((logs.filter(log => log.statusCode >= 400).length / logs.length) * 100)
      : 0
  };
};