import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)
  const port = configService.get('PORT', 3001)
  // swagger congif
  const config = new DocumentBuilder()
    .setVersion('1.0.0')
    .setDescription("hr api project")
    .setTitle('HR')
    .build()
  const document = SwaggerModule.createDocument(app,config)
  SwaggerModule.setup('/api', app, document)
  app.useGlobalPipes(new ValidationPipe())



  await app.listen(port);
}
void bootstrap();
