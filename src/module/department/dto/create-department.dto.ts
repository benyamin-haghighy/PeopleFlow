
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateDepartmentDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsNotEmpty({ message: 'نام دپارتمان نمی‌تواند خالی باشد' })
    @IsString({ message: 'نام دپارتمان باید متن باشد' })
    @MinLength(2, { message: 'نام دپارتمان باید حداقل ۲ حرف باشد' })
    @MaxLength(100, { message: 'نام دپارتمان نمی‌تواند بیشتر از ۱۰۰ حرف باشد' })
    name: string

    @IsOptional()
    @IsString({ message: 'توضیحات باید متن باشد' })
    description?: string
}