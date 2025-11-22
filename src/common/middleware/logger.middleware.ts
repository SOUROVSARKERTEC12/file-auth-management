import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    const { method, originalUrl } = req;
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    // For tracking actual response size
    let responseSize = 0;
    const oldWrite = res.write;
    const oldEnd = res.end;

    // Override `write()`
    res.write = (...args: any[]): boolean => {
      if (args[0]) {
        responseSize += Buffer.byteLength(args[0]);
      }
      return oldWrite.apply(res, args);
    };

    // Override `end()`
    res.end = (...args: any[]): any => {
      if (args[0]) {
        responseSize += Buffer.byteLength(args[0]);
      }
      return oldEnd.apply(res, args);
    };

    // Log incoming request
    this.logger.log(
      `[REQUEST] ${method} ${originalUrl} | IP: ${ip} | UA: ${userAgent}`,
    );

    // Log after response finishes
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      const statusColor =
        statusCode >= 500
          ? COLORS.serverError
          : statusCode >= 400
            ? COLORS.clientError
            : COLORS.success;

      const resetColor = COLORS.reset;

      const logMessage =
        `[RESPONSE] ${method} ${originalUrl} ` +
        `| Status: ${statusColor}${statusCode}${resetColor} ` +
        `| Time: ${duration}ms ` +
        `| Size: ${responseSize} bytes`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

export const COLORS = {
  success: '\x1b[36m', // Cyan
  clientError: '\x1b[35m', // Magenta
  serverError: '\x1b[34m', // Blue
  reset: '\x1b[0m',
};
