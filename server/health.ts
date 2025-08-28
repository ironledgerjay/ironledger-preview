import { Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { getLogStats } from './middleware/logging';

const sql = neon(process.env.DATABASE_URL!);

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
    payfast: {
      status: 'up' | 'down' | 'unknown';
      error?: string;
    };
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    api: {
      totalRequests: number;
      requestsLastHour: number;
      requestsLast24Hours: number;
      averageResponseTime: number;
      errorRate: number;
    };
  };
}

export const healthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
  
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    checks: {
      database: { status: 'down' },
      payfast: { status: 'unknown' },
      memory: { used: 0, total: 0, percentage: 0 },
      api: { totalRequests: 0, requestsLastHour: 0, requestsLast24Hours: 0, averageResponseTime: 0, errorRate: 0 }
    }
  };

  // Database health check
  try {
    const dbStart = Date.now();
    await sql`SELECT 1 as health_check`;
    health.checks.database = {
      status: 'up',
      responseTime: Date.now() - dbStart
    };
  } catch (error) {
    health.checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
    overallStatus = 'unhealthy';
  }

  // PayFast health check (basic connectivity)
  try {
    if (process.env.VITE_PAYFAST_MERCHANT_ID && process.env.VITE_PAYFAST_MERCHANT_KEY) {
      health.checks.payfast.status = 'up';
    } else {
      health.checks.payfast = {
        status: 'down',
        error: 'PayFast credentials not configured'
      };
      overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
    }
  } catch (error) {
    health.checks.payfast = {
      status: 'down',
      error: error instanceof Error ? error.message : 'PayFast connectivity error'
    };
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  // Memory usage
  const memUsage = process.memoryUsage();
  health.checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
  };

  // High memory usage warning
  if (health.checks.memory.percentage > 90) {
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  // API statistics
  health.checks.api = getLogStats();

  // High error rate warning
  if (health.checks.api.errorRate > 10) {
    overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
  }

  health.status = overallStatus;

  // Return appropriate HTTP status
  const statusCode = overallStatus === 'healthy' ? 200 : 
                    overallStatus === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
};

export const readinessCheck = async (req: Request, res: Response) => {
  try {
    // Quick database connectivity check
    await sql`SELECT 1`;
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Service not ready'
    });
  }
};

export const livenessCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};