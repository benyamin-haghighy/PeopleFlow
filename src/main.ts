import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import cookieParser from "cookie-parser"
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import path from 'node:path';
async function bootstrap() {
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.get('PORT', 3001)
  // set view engin
  app.setBaseViewsDir(path.join(__dirname, 'views'))
  app.setViewEngine('ejs')
  // set defaul perfix
  app.setGlobalPrefix('api/v1')
  // user global pipe

  app.useGlobalPipes(new ValidationPipe())
  // set cors
  app.enableCors({
    origin: ['localhost:3000'],
    methods: ["POST",'GET', 'DELETE', 'PUT', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,

  })
  // use lobal interceptors
  app.useGlobalInterceptors(new ResponseInterceptor())
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
      if (!path.includes('/manager') && !path.includes('/auth')) {
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
      if (!path.includes('/employee') && !path.includes('/auth')) {
        delete employeeDocument.paths[path];
      }
    });
  }

  SwaggerModule.setup('/api/employee', app, employeeDocument);



  await app.listen(port);
}
void bootstrap();
