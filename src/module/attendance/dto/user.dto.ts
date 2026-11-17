import { IsNotEmpty } from "class-validator"
import { Role } from "../../../shared/enums/user-role.enum"


export class userDto{
    id: number
    role: Role
}