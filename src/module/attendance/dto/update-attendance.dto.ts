import { PartialType } from '@nestjs/swagger';
import { attendanceDto } from './attendance.dto';

export class UpdateAttendanceDto extends PartialType(attendanceDto) {}
