import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, ParseIntPipe, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginAuthDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { RefreshToken } from './entities/refreshToken.entity';
import { Public } from './decorators/public.decorators';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RoleDt } from './decorators/role.decorator';
import { Role } from '../../shared/enums/user-role.enum';
import { RoleGuard } from './guards/role.guard';
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
  @ApiBearerAuth()
  @RoleDt(Role.MANAGER)
  @UseGuards(RoleGuard)
  @Post('create-manager')
  @ApiOperation({ summary: 'ساخت حساب مدیر' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'مدیر با موفقیت ساخته شد' })
  createManager(@Body() dto: RegisterDto) {
    return this.authService.createManager(dto);
  }
  @Post('login')
  async login(@Body() dto: LoginAuthDto, @Res() res: Response) {
    const { refreshToken, accessToken, user } = await this.authService.login(dto);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(200).json({
      user,
      accessToken
    })
  }
  @Post("refresh/user/:id")
  async refreshToken(@Req() req: Request, @Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const refreshToken = req.signedCookies['refreshToken']
    if (!refreshToken) {
      throw new UnauthorizedException('رفرش توکنی برای شما ثیت نشده لطفا دوباره لاگین کنید')
    }
    const tokens = await this.authService.refreshToken(id, refreshToken)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      signed: true,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    return res.status(201).json({
      accessToken: tokens.accessToken,
    })
  }
}
