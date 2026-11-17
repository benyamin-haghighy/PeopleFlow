import { IsDateString, IsOptional } from 'class-validator';

export class PayrollFilterDto {
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}