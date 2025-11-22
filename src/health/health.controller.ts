import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { HealthService, HealthCheckResult } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Check the health status of the application, including database connectivity and memory usage.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check completed successfully',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ok', 'error'],
          example: 'ok',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00.000Z',
        },
        uptime: {
          type: 'number',
          description: 'Application uptime in seconds',
          example: 3600,
        },
        environment: {
          type: 'string',
          example: 'development',
        },
        version: {
          type: 'string',
          example: '1.0.0',
        },
        checks: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up',
                },
                message: {
                  type: 'string',
                  example: 'Database connection successful',
                },
                responseTime: {
                  type: 'number',
                  description: 'Response time in milliseconds',
                  example: 5,
                },
              },
            },
            memory: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['up', 'down'],
                  example: 'up',
                },
                used: {
                  type: 'number',
                  description: 'Used memory in MB',
                  example: 50,
                },
                total: {
                  type: 'number',
                  description: 'Total memory in MB',
                  example: 100,
                },
                percentage: {
                  type: 'number',
                  description: 'Memory usage percentage',
                  example: 50.0,
                },
              },
            },
          },
        },
      },
    },
  })
  async checkHealth(): Promise<HealthCheckResult> {
    return this.healthService.checkHealth();
  }
}

