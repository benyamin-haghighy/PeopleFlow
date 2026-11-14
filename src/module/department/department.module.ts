import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Departments} from "./entities/department.entity"
import { ManagerDepartmentController } from './controllers/department-manager.controller';
import { DepartmentManageService } from './service/department-manager.service';
import { EmployeeDepartmentController } from './controllers/department-employe.controller';
@Module({
    imports:[TypeOrmModule.forFeature([Departments])],
    controllers:[ManagerDepartmentController, EmployeeDepartmentController],
    providers:[DepartmentManageService]
})
export class DepartmentModule {
}
