import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    example: 'Junior',
    description: 'نام گروه شغلی',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'شناسه پایه حقوق',
  })
  @IsInt()
  @Min(1)
  baseSalaryId: number;
}