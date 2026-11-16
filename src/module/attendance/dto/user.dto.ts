import { IsNotEmpty } from "class-validator"
import { Role } from "../../../shared/enums/user-role.enum"


export class userDto{
    sub: number
    role: Role
}