import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DepartmentModule } from './module/department/department.module';
import { AuthModule } from './module/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { jwtGuard } from './module/auth/guards/jwt-auth.guard';
import { AttendanceModule } from './module/attendance/attendance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedisModule } from './module/redis/redis.module';
import { PayRolleModule } from './module/payroll/payroll.module';
import {ServeStaticModule} from "@nestjs/serve-static"
import path from 'path';
import { WebModule } from './web/web.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: Number(configService.getOrThrow('DB_PORT')),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow('DB_STATUS') === "development" ? true : false,
      }),
    },),
    DepartmentModule,
    AuthModule,
    AttendanceModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    RedisModule,
    PayRolleModule,
    ServeStaticModule.forRoot({
      rootPath:path.join(__dirname, 'public'),
      serveRoot:'/public'
    },{
      rootPath:path.join(__dirname, 'public', 'js'),
      serveRoot:"/js"
    },{
      rootPath:path.join(__dirname, 'public', 'css'),
      serveRoot:"/css"
    }),
    WebModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: jwtGuard
    }]
})
export class AppModule { }
