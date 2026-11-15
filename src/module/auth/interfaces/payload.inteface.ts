import { Role } from "../../../shared/enums/user-role.enum"

export interface payloadJwtStrategy {
    sub: number
    role: Role
}