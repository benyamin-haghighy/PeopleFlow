
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
export class AttendanceFilterDto {

    @ApiPropertyOptional({
        description: 'تاریخ شروع بازه جستجو با فرمت YYYY/MM/DD',
        example: '2026/11/01',
        required: false,
    })
    @IsOptional()
    @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
        message: 'تاریخ شروع باید با فرمت YYYY/MM/DD باشد',
    })
    @Transform(({ value }) => {
        if (typeof value === 'string' && value.includes('T')) {
            return value.split('T')[0];
        }
        return value;
    })
    startDate?: string;

    @ApiPropertyOptional({
        description: 'تاریخ پایان بازه جستجو با فرمت YYYY/MM/DD',
        example: '2026/11/16',
        required: false,
    })
    @IsOptional()
    @Matches(/^\d{4}\/\d{2}\/\d{2}$/, {
        message: 'تاریخ پایان باید با فرمت YYYY/MM/DD باشد',
    })
    @Transform(({ value }) => {
        if (typeof value === 'string' && value.includes('T')) {
            return value.split('T')[0];
        }
        return value;
    })
    endDate?: string;
}
