import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { attendanceDto } from './dto/attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { And, IsNull, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AttendanceStatus } from './enum/AttendanceStatus.enum';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly eventEmitte: EventEmitter2
  ) { }
  @Cron('0 0 21 * * 0-4,6')
  async RegisterAbsence() {
    const { workDate } = this.getCompanyTime()
    const [users] = await this.eventEmitte.emitAsync('users.find')
    for (const user of users) {
      const isDate = await this.attendanceRepository.findOne({
        where: {
          workDate,
          userId: user.id
        }
      })
      if (isDate?.status===AttendanceStatus.ABSENT || isDate?.status===AttendanceStatus.INCOMPLETE) {
        continue
      }else if (isDate) {
        if (!isDate.checkOutTime) {
          isDate.status = AttendanceStatus.INCOMPLETE
          await this.attendanceRepository.save(isDate)
        }
      } else {
        const check = this.attendanceRepository.create({ userId: user.id, status: AttendanceStatus.ABSENT, workDate })
        await this.attendanceRepository.save(check)
      }
    }
  }
  async checkInTime(dto: attendanceDto, userId: number) {
    const { workDate, hour } = this.getCompanyTime()
    if (hour < 7 || hour > 12) {
      throw new ForbiddenException('زمان مجاز ثبت ورود از ساعت ۷ تا ۱۱ صبح است');
    }

    try {
      return await this.attendanceRepository.save(
        this.attendanceRepository.create({ userId, workDate, checkInTime: new Date(), note: dto.note })
      )
    } catch (error: any) {
      if (error.driverError?.code === '23505') {
        throw new ConflictException('ورود امروز شما قبلاً ثبت شده است')
      }
      throw error
    }
  }
  getCompanyTime(now = new Date(), timeZone = 'Asia/Tehran') {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(now)
    const get = (type: string) => parts.find(p => p.type === type)!.value
    return {
      workDate: `${get('year')}-${get('month')}-${get('day')}`,
      hour: Number(get('hour')),
      minute: Number(get('minute')),
    }
  }
  async checkOutTime(userId: number) {
    const { workDate, hour } = this.getCompanyTime()
    const IsTime = await this.attendanceRepository.findOne({
      where: {
        workDate,
        userId
      }
    })
    if (hour >= 20) {
      throw new ForbiddenException('زمان مجاز ثبت خروج قبل ساعت ۸ شب  است');
    }
    if (!IsTime) {
      throw new BadRequestException('شما ورود خودرا ثیت نکرده اید ابتدا ورود خود را ثبت کنید')
    }
    if (IsTime.checkOutTime) {
      throw new ForbiddenException('زمان خروج برای شما ثیت شده است')
    }
    IsTime.checkOutTime = new Date
    return this.attendanceRepository.save(IsTime)
  }


  async filterAttendance(userId: number, filter: AttendanceFilterDto) {

    if (!filter.endDate && !filter.startDate) {
      return this.attendanceRepository.find({
        where: {
          userId,
          checkOutTime: Not(IsNull())
        }
      });
    }

    if (filter.startDate && !filter.endDate) {
      return this.attendanceRepository.find({
        where: {
          userId,
          workDate: MoreThanOrEqual(filter.startDate)
        }
      });
    }

    if (!filter.startDate && filter.endDate) {
      return this.attendanceRepository.find({
        where: {
          userId,
          workDate: LessThanOrEqual(filter.endDate)
        }
      });
    }
    if (filter.startDate && filter.endDate) {
      return this.attendanceRepository.find({
        where: {
          userId,
          workDate: And(
            MoreThanOrEqual(filter.startDate),
            LessThanOrEqual(filter.endDate)
          )
        }
      });
    }

  }

}
