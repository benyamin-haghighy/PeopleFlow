import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { attendanceDto } from './dto/attendance.dto';
import { User } from './decorators/user.decorator';
import { userDto } from './dto/user.dto';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  checkInTime(@Body() dto: attendanceDto, @User() user:userDto) {
    return this.attendanceService.checkInTime(dto, user.sub);
  }

  @Get()
  checkOutTime(@User() user:userDto) {
    return this.attendanceService.checkOutTime(user.sub);
  }

  @Get(':id')
  filterAttendance(@User() user:userDto, dto:AttendanceFilterDto) {
    return this.attendanceService.filterAttendance(user.sub, dto);
  }
}
