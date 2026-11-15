import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) { }
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const roles = this.reflector.getAllAndOverride('roles', [context.getHandler(), context.getClass()])
        console.log(roles);
        
        const req = context.switchToHttp().getRequest()
        if (!req.user) {
            throw new UnauthorizedException("لطفا دوباره لاگین کنید");
        }
        console.log(req.user);
        
        if (!roles) {
            return true
        }
        const IsRoleInUser = roles.some((role: string) => {
            return req.user.role === role
        })
        if (!IsRoleInUser) {
            throw new ForbiddenException('شما دسترسی به این مسیر را ندارید')
        }
        return true
    }
}