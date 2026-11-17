
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { PayrollFilterDto } from '../dto/payrolle-employee-filter.dto';
import { EmployeeService } from '../service/payyrole-employee.service';
import { User } from '../../attendance/decorators/user.decorator';
import { Role } from '../../../shared/enums/user-role.enum';
import { userDto } from '../../attendance/dto/user.dto';
import { RoleDt } from '../../auth/decorators/role.decorator';
import { RoleGuard } from '../../auth/guards/role.guard';

@ApiTags('Employee Payroll')
@ApiBearerAuth()
@RoleDt(Role.EMPLOYE)
@UseGuards(RoleGuard)
@Controller('employee/payrolle')
export class EmployeeController {
    constructor(
        private readonly employeeService: EmployeeService,
    ) {}

    @Get('payroll/:id')
    @ApiOperation({ summary: 'دریافت فیش حقوقی کارمند بر اساس شناسه' })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'شناسه فیش حقوقی',
    })
    @ApiResponse({
        status: 200,
        description: 'فیش حقوقی با موفقیت دریافت شد',
    })
    @ApiResponse({
        status: 401,
        description: 'کاربر احراز هویت نشده است',
    })
    @ApiResponse({
        status: 403,
        description: 'دسترسی به این بخش مجاز نیست',
    })
    @ApiResponse({
        status: 404,
        description: 'فیش حقوقی مورد نظر پیدا نشد',
    })
    @ApiResponse({
        status: 400,
        description: 'شناسه وارد شده معتبر نیست',
    })
    getPayrollById(
        @Param('id', ParseIntPipe) id: number,
        @User() user: userDto,
    ) {
        return this.employeeService.getPayrollById(
            id,
            user.id,
        );
    }

    @Get('payroll')
    @ApiOperation({ summary: 'دریافت فیش‌های حقوقی کارمند با امکان فیلتر تاریخ' })
    @ApiQuery({
        name: 'startDate',
        required: false,
        type: String,
        example: '2026-10-01',
        description: 'تاریخ شروع بازه',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        type: String,
        example: '2026-10-30',
        description: 'تاریخ پایان بازه',
    })
    @ApiResponse({
        status: 200,
        description: 'لیست فیش‌های حقوقی کاربر با موفقیت دریافت شد',
    })
    @ApiResponse({
        status: 401,
        description: 'کاربر احراز هویت نشده است',
    })
    @ApiResponse({
        status: 403,
        description: 'دسترسی به این بخش مجاز نیست',
    })
    getUserPayrolls(
        @Query() filter: PayrollFilterDto,
        @User() user: userDto,
    ) {
        return this.employeeService.getUserPayrolls(
            user.id,
            filter,
        );
    }
}
