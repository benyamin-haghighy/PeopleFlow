
import { Transform } from 'class-transformer';
import { IsMobilePhone, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength, minLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'نام و نام خانوادگی کاربر',
    example: 'Benyamin Haghighy',
    required: true,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  name: string;

  @ApiProperty({
    description: 'شماره موبایل کاربر با فرمت ایران',
    example: '09123456789',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('fa-IR')
  phone: string;

  @ApiProperty({
    description: 'رمز عبور حساب کاربری',
    example: 'StrongPassword123',
    required: true,
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: "پسودر باید حداقل هشت کاراکتر باشد" })
  @MaxLength(16, { message: "پسودر باید حداکثر ۱۶ کاراکتر باشد" })
  password: string;
  @ApiProperty({
    description: 'شناسه گروه حقوقی کاربر',
    example: 1,
    required: true,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  groupId: number;
}
