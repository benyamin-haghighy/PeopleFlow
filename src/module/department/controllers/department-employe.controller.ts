import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'
import { DepartmentManageService } from '../service/department-manager.service'
import { ApiBearerAuth } from '@nestjs/swagger'
import { RoleGuard } from '../../auth/guards/role.guard'
import { RoleDt } from '../../auth/decorators/role.decorator'
import { Role } from '../../../shared/enums/user-role.enum'

@ApiBearerAuth()
@UseGuards(RoleGuard)
@RoleDt(Role.EMPLOYE)
@Controller('employee/departments')
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