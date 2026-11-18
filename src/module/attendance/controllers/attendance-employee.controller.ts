
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AttendanceService } from '../service/attendance-employee.service';
import { attendanceDto } from '../dto/attendance.dto';
import { User } from '../decorators/user.decorator';
import { userDto } from '../dto/user.dto';
import { AttendanceFilterDto } from '../dto/attendance-filter.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}
  @Post('checkin')
  @ApiOperation({ summary: 'ثبت ساعت ورود کارمند' })
  @ApiBody({ type: attendanceDto })
  @ApiResponse({
    status: 201,
    description: 'ورود با موفقیت ثبت شد',
  })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات ورودی نامعتبر است یا ورود قبلاً ثبت شده است',
  })
  @ApiResponse({
    status: 403,
    description: 'اجازه ثبت ورود در این ساعت را ندارید',
  })
  @ApiResponse({
    status: 401,
    description: 'کاربر احراز هویت نشده است',
  })
  checkInTime(
    @Body() dto: attendanceDto,
    @User() user: userDto,
  ) {
    return this.attendanceService.checkInTime(dto, user.id);
  }

  @Get('checkout')
  @ApiOperation({ summary: 'ثبت ساعت خروج کارمند' })
  @ApiResponse({
    status: 200,
    description: 'ساعت خروج با موفقیت ثبت شد',
  })
  @ApiResponse({
    status: 400,
    description: 'ورود کاربر ثبت نشده یا خروج قبلاً ثبت شده است',
  })
  @ApiResponse({
    status: 401,
    description: 'کاربر احراز هویت نشده است',
  })
  checkOutTime(
    @User() user: userDto,
  ) {
    return this.attendanceService.checkOutTime(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'دریافت و فیلتر سوابق حضور و غیاب کارمند' })
  @ApiBody({ type: AttendanceFilterDto })
  @ApiResponse({
    status: 200,
    description: 'سوابق حضور و غیاب با موفقیت دریافت شد',
  })
  @ApiResponse({
    status: 400,
    description: 'فیلترهای ارسالی نامعتبر هستند',
  })
  @ApiResponse({
    status: 401,
    description: 'کاربر احراز هویت نشده است',
  })
  filterAttendance(
    @User() user: userDto,
    @Body() dto: AttendanceFilterDto,
  ) {
    return this.attendanceService.filterAttendance(user.id, dto);
  }
}
