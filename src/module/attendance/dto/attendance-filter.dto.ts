import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AttendanceFilterDto {
  @ApiPropertyOptional({
    description: 'تاریخ شروع بازه جستجو با فرمت YYYY-MM-DD',
    example: '2026-11-01',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0];
    }
    return value;
  })
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'تاریخ پایان بازه جستجو با فرمت YYYY-MM-DD',
    example: '2026-11-18',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0];
    }
    return value;
  })
  @IsDateString()
  endDate?: string;
}