import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from "@nestjs/jwt"
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
import { USER } from './entities/user.entity';
import { jwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RoleGuard } from './guards/role.guard';
import { Group } from '../payroll/entities/group.entity';
@Module({
  imports: [PassportModule, JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow('ACCESS_TOKEN_SECRETE'),
      signOptions: { expiresIn: configService.getOrThrow('ACCESS_TOKEN_EXPIREIN') }
    })
  }),
    TypeOrmModule.forFeature([RefreshToken, USER,Group])
  ],
  controllers: [AuthController],
  providers: [AuthService, jwtStrategy,RoleGuard],
  exports:[RoleGuard, AuthService]
})
export class AuthModule { }
