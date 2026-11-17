import { Module } from '@nestjs/common';
import { AttendanceService } from './service/attendance-employee.service';
import { AttendanceController } from './controllers/attendance-employee.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Attendance])],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports:[AttendanceService]
})
export class AttendanceModule {}
