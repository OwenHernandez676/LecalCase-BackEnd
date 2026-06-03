import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/** Filtro de errores global: normaliza la respuesta de errores HTTP. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
    const message = typeof payload === 'string' ? payload : (payload as { message?: string }).message;

    this.logger.error(`${req.method} ${req.url} → ${status}`, exception instanceof Error ? exception.stack : undefined);

    res.status(status).json({
      statusCode: status,
      path: req.url,
      timestamp: new Date().toISOString(),
      message: message ?? 'Error',
    });
  }
}
