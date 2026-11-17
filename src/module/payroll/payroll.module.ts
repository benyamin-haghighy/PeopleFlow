import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ManagerService } from "./service/payroll-manager.service";
import { Group } from "./entities/group.entity";
import { BaseSalary } from "./entities/baseSalary-group.entity";
import { AuthModule } from "../auth/auth.module";
import { EmployeeService } from "./service/payyrole-employee.service";
import { Payroll } from "./entities/payroll.entity";
import { AttendanceModule } from "../attendance/attendance.module";
import { ManagerController } from "./controllers/payroll-manager.controller";
import { EmployeeController } from "./controllers/payrolle-employee.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Group,
      BaseSalary,
      Payroll
    ]),
    AuthModule,
    AttendanceModule
  ],
  controllers:[ManagerController, EmployeeController],
  providers: [ManagerService, EmployeeService],
  exports: [ManagerService, EmployeeService],
})
export class PayRolleModule {}