import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { DepartmentManageService } from '../service/department-manager.service'
import { CreateDepartmentDto } from '../dto/create-department.dto'
import { UpdateDepartmentDto } from '../dto/update-department.dto'

@Controller('manager/departments')
export class ManagerDepartmentController {
    constructor(private readonly departmentService: DepartmentManageService) {}

    @Post()
    create(@Body() dto: CreateDepartmentDto) {
        return this.departmentService.create(dto)
    }

    @Get()
    findAll() {
        return this.departmentService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.departmentService.findOne(id)
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDepartmentDto) {
        return this.departmentService.update(id, dto)
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.departmentService.remove(id)
    }
}