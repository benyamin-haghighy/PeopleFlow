import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import path from 'node:path';
import { FilterError } from './common/filter/error.filter';
async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.get('PORT', 3001)
  // set view engin
  app.setBaseViewsDir(path.join(__dirname, 'views'))
  app.setViewEngine('ejs')
  // set defaul perfix

  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'login', method: RequestMethod.GET },
      { path: 'register', method: RequestMethod.GET },

      { path: 'manager', method: RequestMethod.GET },
      { path: 'manager/departments', method: RequestMethod.GET },
      { path: 'manager/groups', method: RequestMethod.GET },
      { path: 'manager/payroll', method: RequestMethod.GET },
      { path: 'manager/create-manager', method: RequestMethod.GET },

      { path: 'employee', method: RequestMethod.GET },
      { path: 'employee/attendance', method: RequestMethod.GET },
      { path: 'employee/payroll', method: RequestMethod.GET },
      { path: 'employee/departments', method: RequestMethod.GET },
      { path: 'employee/account', method: RequestMethod.GET },

      { path: '403', method: RequestMethod.GET },
      { path: '404', method: RequestMethod.GET },
    ],
  });

  // user global pipe

  app.useGlobalPipes(new ValidationPipe())
  // set cors
  app.enableCors({
    origin: ['localhost:3000'],
    methods: ["POST", 'GET', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,

  })
  // use lobal interceptors
  app.useGlobalInterceptors(new ResponseInterceptor())
  // set filter error
  app.useGlobalFilters(new FilterError)
  // cookieParser
  app.use(cookieParser(configService.getOrThrow("COOKIE_SECRET")));
  // Swagger Manager
  const managerConfig = new DocumentBuilder()
    .setVersion('1.0.0')
    .setTitle('HR - Manager API')
    .setDescription('مستندات API مربوط به مدیران سیستم منابع انسانی')
    .addBearerAuth()
    .build();

  const managerDocument = SwaggerModule.createDocument(app, managerConfig);

  if (managerDocument.paths) {
    Object.keys(managerDocument.paths).forEach((path) => {
      if (!path.includes('/manager') && !path.includes('/auth') && !path.includes('/attendance')) {
        delete managerDocument.paths[path];
      }
    });
  }

  SwaggerModule.setup('/api/manager', app, managerDocument);


  // Swagger Employee
  const employeeConfig = new DocumentBuilder()
    .setVersion('1.0.0')
    .setTitle('HR - Employee API')
    .setDescription('مستندات API مربوط به کارمندان سیستم منابع انسانی')
    .addBearerAuth()
    .build();

  const employeeDocument = SwaggerModule.createDocument(app, employeeConfig);

  if (employeeDocument.paths) {
    Object.keys(employeeDocument.paths).forEach((path) => {
      if (path.includes('auth/create-manager')) {
        delete employeeDocument.paths[path]
      }
      if (!path.includes('/employee') && !path.includes('/auth') && !path.includes('/attendance')) {
        delete employeeDocument.paths[path];
      }
    });
  }

  SwaggerModule.setup('/api/employee', app, employeeDocument);



  await app.listen(port);
}
void bootstrap();
