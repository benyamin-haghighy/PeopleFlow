
import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { CreateBaseSalaryDto } from '../dto/baseSalary.dto';
import { CreateGroupDto } from '../dto/group.dto';
import { PayrollFilterDto } from '../dto/payrolle-employee-filter.dto';
import { UpdatePayrollDto } from '../dto/payrolle-update.dto';
import { payrollStatus } from '../enums/payroll-status.enum';
import { ManagerService } from '../service/payroll-manager.service';
import { RoleDt } from '../../auth/decorators/role.decorator';
import { Role } from '../../../shared/enums/user-role.enum';
import { RoleGuard } from '../../auth/guards/role.guard';

@ApiTags('Manager Payroll')
@ApiBearerAuth()
@RoleDt(Role.MANAGER)
@UseGuards(RoleGuard)
@Controller('manager/payrolle')
export class ManagerController {
    constructor(
        private readonly managerService: ManagerService,
    ) {}

    @Post('base-salary')
    @ApiOperation({ summary: 'ایجاد پایه حقوق جدید' })
    @ApiBody({ type: CreateBaseSalaryDto })
    @ApiResponse({ status: 201, description: 'پایه حقوق با موفقیت ایجاد شد' })
    @ApiResponse({ status: 400, description: 'اطلاعات ورودی نامعتبر است' })
    createBaseSalary(@Body() dto: CreateBaseSalaryDto) {
        return this.managerService.createBaseSalary(dto);
    }

    @Post('groups')
    @ApiOperation({ summary: 'ایجاد گروه شغلی جدید' })
    @ApiBody({ type: CreateGroupDto })
    @ApiResponse({ status: 201, description: 'گروه با موفقیت ایجاد شد' })
    @ApiResponse({ status: 404, description: 'پایه حقوق مورد نظر پیدا نشد' })
    createGroup(@Body() dto: CreateGroupDto) {
        return this.managerService.createGroup(dto);
    }

    @Get('groups')
    @ApiOperation({ summary: 'دریافت لیست گروه‌های شغلی' })
    @ApiResponse({ status: 200, description: 'لیست گروه‌ها با اطلاعات پایه حقوق' })
    getGroups() {
        return this.managerService.getGroups();
    }

    @Patch('groups/:groupId/base-salary/:baseSalaryId')
    @ApiOperation({ summary: 'تغییر پایه حقوق گروه شغلی' })
    @ApiParam({ name: 'groupId', type: Number, example: 1, description: 'شناسه گروه' })
    @ApiParam({ name: 'baseSalaryId', type: Number, example: 2, description: 'شناسه پایه حقوق جدید' })
    @ApiResponse({ status: 200, description: 'پایه حقوق گروه با موفقیت تغییر کرد' })
    @ApiResponse({ status: 404, description: 'گروه یا پایه حقوق پیدا نشد' })
    updateGroupBaseSalary(
        @Param('groupId', ParseIntPipe) groupId: number,
        @Param('baseSalaryId', ParseIntPipe) baseSalaryId: number,
    ) {
        return this.managerService.updateGroupBaseSalary(
            groupId,
            baseSalaryId,
        );
    }

    @Get()
    @ApiOperation({ summary: 'فیلتر و دریافت لیست فیش‌های حقوقی' })
    @ApiQuery({ name: 'startDate', required: false, type: String, example: '2026-10-01' })
    @ApiQuery({ name: 'endDate', required: false, type: String, example: '2026-10-30' })
    @ApiQuery({ name: 'status', required: false, enum: payrollStatus })
    @ApiResponse({ status: 200, description: 'لیست فیش‌های حقوقی' })
    payRollesFilter(
        @Query() filter: PayrollFilterDto,
        @Query('status') status?: payrollStatus,
    ) {
        return this.managerService.payRollesFilter(filter, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'دریافت فیش حقوقی با شناسه' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'شناسه فیش حقوقی' })
    @ApiResponse({ status: 200, description: 'فیش حقوقی مورد نظر' })
    @ApiResponse({ status: 404, description: 'فیش حقوقی پیدا نشد' })
    getPayrollById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.managerService.getPayrollById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'ویرایش فیش حقوقی و وضعیت پرداخت' })
    @ApiParam({ name: 'id', type: Number, example: 1, description: 'شناسه فیش حقوقی' })
    @ApiBody({ type: UpdatePayrollDto })
    @ApiResponse({ status: 200, description: 'فیش حقوقی با موفقیت ویرایش شد' })
    @ApiResponse({ status: 404, description: 'فیش حقوقی پیدا نشد' })
    updatePayroll(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePayrollDto,
    ) {
        return this.managerService.updatePayroll(id, dto);
    }
}
