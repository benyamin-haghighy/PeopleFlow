import { SetMetadata } from "@nestjs/common";
import { Role } from "../../../shared/enums/user-role.enum";


export const RoleDt = (...roles:Role[])=>SetMetadata('roles', roles)