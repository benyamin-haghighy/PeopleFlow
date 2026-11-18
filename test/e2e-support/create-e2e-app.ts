import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  Type,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { Role } from '../../src/shared/enums/user-role.enum';
import { RoleGuard } from '../../src/module/auth/guards/role.guard';
import { ResponseInterceptor } from '../../src/common/interceptors/response.interceptors';
import { FilterError } from '../../src/common/filter/error.filter';

@Injectable()
class TestJwtGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (authorization === 'Bearer manager-test-token') {
      request.user = { id: 1, role: Role.MANAGER };
      return true;
    }
    if (authorization === 'Bearer employee-test-token') {
      request.user = { id: 2, role: Role.EMPLOYE };
      return true;
    }

    throw new UnauthorizedException('احراز هویت انجام نشده است');
  }
}

export async function createE2eApp(
  controller: Type<unknown>,
  serviceToken: Type<unknown>,
  serviceMock: Record<string, unknown>,
): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    controllers: [controller],
    providers: [
      { provide: serviceToken, useValue: serviceMock },
      RoleGuard,
      { provide: APP_GUARD, useClass: TestJwtGuard },
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser('e2e-cookie-secret'));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new FilterError());
  await app.init();
  return app;
}
