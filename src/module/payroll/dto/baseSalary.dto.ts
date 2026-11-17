import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBaseSalaryDto {
  @ApiProperty({
    example: 20000000,
    description: 'مبلغ پایه حقوق',
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  baseSalary: number;
}