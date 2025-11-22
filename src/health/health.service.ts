import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'up' | 'down';
      message?: string;
      responseTime?: number;
    };
    memory: {
      status: 'up' | 'down';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

@Injectable()
export class HealthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const totalMemory = memoryUsage.heapTotal;
    const usedMemory = memoryUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    // Check database connection
    const dbCheck = await this.checkDatabase();

    // Determine overall status
    const overallStatus =
      dbCheck.status === 'up' && memoryPercentage < 95 ? 'ok' : 'error';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      environment: this.configService.get<string>('NODE_ENV') || 'development',
      version: '1.0.0',
      checks: {
        database: dbCheck,
        memory: {
          status: memoryPercentage < 95 ? 'up' : 'down',
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round(memoryPercentage * 100) / 100,
        },
      },
    };
  }

  private async checkDatabase(): Promise<{
    status: 'up' | 'down';
    message?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      if (!this.dataSource.isInitialized) {
        return {
          status: 'down',
          message: 'Database not initialized',
        };
      }

      // Try to run a simple query
      await this.dataSource.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      return {
        status: 'up',
        message: 'Database connection successful',
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'down',
        message: error.message || 'Database connection failed',
        responseTime,
      };
    }
  }
}

