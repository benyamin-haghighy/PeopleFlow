import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from '@nestjs/typeorm';
import { USER } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refreshToken.entity';
import { RegisterDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginAuthDto } from './dto/login.dto';
import { OnEvent } from "@nestjs/event-emitter";
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(USER)
    private readonly userRepository: Repository<USER>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly configServcie: ConfigService,

  ) { }
  async register(register: RegisterDto) {
    let user = await this.userRepository.findOne({ where: { phone: register.phone } })
    if (user) {
      throw new BadRequestException('کاربری با این شماره تلفن وجود دارد')
    }
    const password = await bcrypt.hash(register.password, 10)
    Object.assign(register, { password })
    user = this.userRepository.create(register)
    const  {password:ps, ...newUser} = await this.userRepository.save(user)
    return newUser
  }
  async validateUser(login: LoginAuthDto) {
    let user = await this.userRepository.findOne({ where: { phone: login.phone } })
    if (!user) {
      throw new NotFoundException('کاربری با این شماره تلفن یافت نشد')
    }
    
    const isPassword = await bcrypt.compare(login.password, user.password)
    if (!isPassword) {
      throw new BadRequestException('پسورد اشتباه می باشد')
    }
    return user
  }
  async login(login: LoginAuthDto) {
    const user = await this.validateUser(login)
    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role })
    const refreshToken = await this.jwt.signAsync({ sub: user.id }, { secret: this.configServcie.getOrThrow('REFRSH_TOKEN_SECRETE'), expiresIn: this.configServcie.getOrThrow('REFRSH_TOKEN_EXPIREIN') })
    const hashRefreshToken = await bcrypt.hash(refreshToken, 12)
    const isRefreshToken = await this.refreshTokenRepository.findOne({ where: { user_id: user.id } })
    let rt
    if (isRefreshToken) {
      rt = Object.assign(isRefreshToken, { token: hashRefreshToken })
    } else {
      rt = this.refreshTokenRepository.create({ token: hashRefreshToken, user })
    }
    await this.refreshTokenRepository.save(rt)
    return {
      user,
      accessToken,
      refreshToken
    }
  }
  async refreshToken(id: number, rt: string) {
    try {
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { user_id: id }, relations: {
          user: true
        }
      })
      if (!refreshToken) {
        throw new NotFoundException('رفرش توکنی برای این کاربر وجود ندارد لطفا ابتدا لاگین کنید')
      }
      const isRefreshToken = await bcrypt.compare(rt, refreshToken.token)
      if (!isRefreshToken) {
        throw new BadRequestException('رفرش توکن ارسالی اششتباه می باشد ')
      }
      await this.jwt.verifyAsync(rt, { secret: this.configServcie.getOrThrow('REFRSH_TOKEN_SECRETE') })
      const accessToken = await this.jwt.signAsync({ sub: refreshToken.user.id, role: refreshToken.user.role })
      const newRefreshToken = await this.jwt.signAsync({ sub: refreshToken.user.id }, { secret: this.configServcie.getOrThrow('REFRSH_TOKEN_SECRETE'), expiresIn: this.configServcie.getOrThrow('REFRSH_TOKEN_EXPIREIN') })
      const hashRefreshToken = await bcrypt.hash(newRefreshToken, 12)
      Object.assign(refreshToken, { token: hashRefreshToken })
      await this.refreshTokenRepository.save(refreshToken)
      return {
        accessToken,
        refreshToken: newRefreshToken
      }
    } catch (error) {
      throw new UnauthorizedException('رفرش توکن منقضی یا نامعتبر است، دوباره لاگین کنید')
    }
  }
  async logOut(id:number){
    await this.refreshTokenRepository.delete({user_id:id})
    return 'با موفقیت خارج شدید'
  }
  async findUserById(id:number){
    let user = await this.userRepository.findOne({ where: { id} })
    if (!user) {
      throw new NotFoundException('کاربری با این ایدی تلفن یافت نشد')
    }
    return user
  }
  @OnEvent('users.find')
  async findAllUsers(){
    return this.userRepository.find()
  }
}
