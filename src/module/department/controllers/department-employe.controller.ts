import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common'
import { DepartmentManageService } from '../service/department-manager.service'


@Controller('employe/departments')
export class EmployeeDepartmentController {
    constructor(private readonly departmentService: DepartmentManageService) {}

    @Get()
    findAll() {
        return this.departmentService.findAll()
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.departmentService.findOne(id)
    }
}