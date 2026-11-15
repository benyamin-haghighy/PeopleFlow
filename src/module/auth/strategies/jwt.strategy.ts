import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy} from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt'
import { payloadJwtStrategy } from "../interfaces/payload.inteface";
import { AuthService } from "../auth.service";
@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService,private readonly authService:AuthService) {
        super({
            secretOrKey: configService.getOrThrow('ACCESS_TOKEN_SECRETE'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }
    async validate(payload:payloadJwtStrategy) {
        const user = await this.authService.findUserById(payload.sub)
        return {
            id:user.id,
            role:user.role
        }
    }
}