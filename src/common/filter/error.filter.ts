
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class FilterError implements ExceptionFilter {
  private readonly logger = new Logger(FilterError.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'خطای داخلی سرور رخ داده است';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as Record<string, any>;

        message = body.message ?? message;
        error = body.error ?? error;
      }
    }

    else if (exception instanceof QueryFailedError) {
      const dbError = exception as QueryFailedError & {
        driverError?: {
          code?: string;
          detail?: string;
        };
      };

      switch (dbError.driverError?.code) {
        case '23505':
          statusCode = HttpStatus.CONFLICT;
          message = 'این اطلاعات قبلاً در سیستم ثبت شده است';
          error = 'Conflict';
          break;

        case '23503':
          statusCode = HttpStatus.CONFLICT;
          message = 'این اطلاعات به رکوردهای دیگری وابسته است';
          error = 'Foreign Key Violation';
          break;

        case '23502':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'یکی از فیلدهای اجباری ارسال نشده است';
          error = 'Not Null Violation';
          break;

        case '22P02':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'نوع یا مقدار یکی از فیلدها نامعتبر است';
          error = 'Invalid Input';
          break;

        case '23514':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'مقدار یکی از فیلدها با محدودیت‌های سیستم سازگار نیست';
          error = 'Check Constraint Violation';
          break;

        default:
          statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'خطا در اجرای عملیات پایگاه داده';
          error = 'Database Error';
      }
    }

    this.logger.error(
      `${request.method} ${request.url} | Status: ${statusCode}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
