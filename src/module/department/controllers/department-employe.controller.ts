
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { DepartmentManageService } from '../service/department-manager.service';
import { RoleGuard } from '../../auth/guards/role.guard';
import { RoleDt } from '../../auth/decorators/role.decorator';
import { Role } from '../../../shared/enums/user-role.enum';

@ApiTags('Employee Department')
@ApiBearerAuth()
@UseGuards(RoleGuard)
@RoleDt(Role.EMPLOYE)
@Controller('employee-data/departments')
export class EmployeeDepartmentController {
    constructor(
        private readonly departmentService: DepartmentManageService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'دریافت لیست تمام دپارتمان‌ها' })
    @ApiResponse({
        status: 200,
        description: 'لیست دپارتمان‌ها با موفقیت دریافت شد',
    })
    @ApiResponse({
        status: 401,
        description: 'کاربر احراز هویت نشده است',
    })
    @ApiResponse({
        status: 403,
        description: 'دسترسی به این بخش مجاز نیست',
    })
    findAll() {
        return this.departmentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'دریافت اطلاعات دپارتمان بر اساس شناسه' })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'شناسه دپارتمان',
    })
    @ApiResponse({
        status: 200,
        description: 'اطلاعات دپارتمان دریافت شد',
    })
    @ApiResponse({
        status: 400,
        description: 'شناسه وارد شده معتبر نیست',
    })
    @ApiResponse({
        status: 404,
        description: 'دپارتمان مورد نظر پیدا نشد',
    })
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.departmentService.findOne(id);
    }
}
