import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DepartmentModule } from './module/department/department.module';
import { AuthModule } from './module/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { jwtGuard } from './module/auth/guards/jwt-auth.guard';
import { AttendanceModule } from './module/attendance/attendance.module';
import { ScheduleModule } from '@nestjs/schedule';
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
    ScheduleModule.forRoot()
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: jwtGuard
    }]
})
export class AppModule { }
