import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaKnownRequestExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaKnownRequestExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    this.logger.error(
      `Prisma error ${exception.code}: ${exception.message}`,
      exception.meta,
    );

    if (exception.code === 'P2021') {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message:
          'Database schema is not applied. Run: cd api && npx prisma migrate deploy',
      });
    }

    if (exception.code === 'P2002') {
      const target = (exception.meta?.target as string[] | undefined)?.join(
        ', ',
      );
      return res.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: target
          ? `A record with this ${target} already exists.`
          : 'A record with this value already exists.',
      });
    }

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Database error.',
    });
  }
}
