import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { payrollStatus } from '../enums/payroll-status.enum';

export class UpdatePayrollDto {
    @IsOptional()
    @IsEnum(payrollStatus)
    status?: payrollStatus;

    @IsOptional()
    @IsInt()
    @Min(0)
    bonuses?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    deduction?: number;

    @IsOptional()
    @IsString()
    note?: string;
}