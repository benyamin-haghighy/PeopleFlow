
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { DepartmentManageService } from '../service/department-manager.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { RoleGuard } from '../../auth/guards/role.guard';
import { RoleDt } from '../../auth/decorators/role.decorator';
import { Role } from '../../../shared/enums/user-role.enum';

@ApiTags('Manager Department')
@ApiBearerAuth()
@UseGuards(RoleGuard)
@RoleDt(Role.MANAGER)
@Controller('manager/departments')
export class ManagerDepartmentController {
    constructor(
        private readonly departmentService: DepartmentManageService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'ایجاد دپارتمان جدید' })
    @ApiBody({ type: CreateDepartmentDto })
    @ApiResponse({
        status: 201,
        description: 'دپارتمان با موفقیت ایجاد شد',
    })
    @ApiResponse({
        status: 409,
        description: 'دپارتمانی با این نام وجود دارد',
    })
    create(
        @Body() dto: CreateDepartmentDto,
    ) {
        return this.departmentService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'دریافت لیست تمام دپارتمان‌ها' })
    @ApiResponse({
        status: 200,
        description: 'لیست دپارتمان‌ها دریافت شد',
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
        status: 404,
        description: 'دپارتمان مورد نظر پیدا نشد',
    })
    findOne(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.departmentService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'ویرایش اطلاعات دپارتمان' })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'شناسه دپارتمان',
    })
    @ApiBody({ type: UpdateDepartmentDto })
    @ApiResponse({
        status: 200,
        description: 'دپارتمان با موفقیت ویرایش شد',
    })
    @ApiResponse({
        status: 404,
        description: 'دپارتمان مورد نظر پیدا نشد',
    })
    @ApiResponse({
        status: 409,
        description: 'دپارتمانی با این نام وجود دارد',
    })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateDepartmentDto,
    ) {
        return this.departmentService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'حذف دپارتمان' })
    @ApiParam({
        name: 'id',
        type: Number,
        example: 1,
        description: 'شناسه دپارتمان',
    })
    @ApiResponse({
        status: 200,
        description: 'دپارتمان با موفقیت حذف شد',
    })
    @ApiResponse({
        status: 404,
        description: 'دپارتمان مورد نظر پیدا نشد',
    })
    remove(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.departmentService.remove(id);
    }
}
