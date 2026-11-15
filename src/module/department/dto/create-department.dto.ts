
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({
    description: 'نام دپارتمان',
    example: 'Human Resources',
    required: true,
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value
  )
  @IsNotEmpty({ message: 'نام دپارتمان نمی‌تواند خالی باشد' })
  @IsString({ message: 'نام دپارتمان باید متن باشد' })
  @MinLength(2, { message: 'نام دپارتمان باید حداقل ۲ حرف باشد' })
  @MaxLength(100, { message: 'نام دپارتمان نمی‌تواند بیشتر از ۱۰۰ حرف باشد' })
  name: string;

  @ApiPropertyOptional({
    description: 'توضیحات تکمیلی درباره دپارتمان',
    example: 'مسئول مدیریت منابع انسانی و فرایندهای استخدام',
  })
  @IsOptional()
  @IsString({ message: 'توضیحات باید متن باشد' })
  description?: string;
}
