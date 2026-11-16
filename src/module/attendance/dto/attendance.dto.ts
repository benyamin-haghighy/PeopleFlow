import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class attendanceDto {
    @IsOptional()
    @IsString()
    note?:string
}
