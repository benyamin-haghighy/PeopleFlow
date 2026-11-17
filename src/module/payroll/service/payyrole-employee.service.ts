import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { Group } from '../entities/group.entity';
import { BaseSalary } from '../entities/baseSalary-group.entity';
import { Cron } from '@nestjs/schedule';
import { AuthService } from '../../auth/auth.service';
import { AttendanceService } from '../../attendance/service/attendance-employee.service';
import { AttendanceStatus } from '../../attendance/enum/AttendanceStatus.enum';
import { Payroll } from '../entities/payroll.entity';
import { PayrollFilterDto } from '../dto/payrolle-employee-filter.dto';

@Injectable()
export class EmployeeService {

    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(Payroll)
        private readonly payRolleRepository: Repository<Payroll>,
        private readonly authService: AuthService,
        private readonly attendanceService: AttendanceService,
    ) { }
    @Cron('0 0 12 29 * *')
    async createPayrolle() {
        let now: any = new Date()
        let oneMonthAgoDate: any = new Date((now.getTime() - (29 * 24 * 60 * 60 * 1000)))
        now = now.toISOString().split('T')[0];
        oneMonthAgoDate = oneMonthAgoDate.toISOString().split('T')[0];
        const users = await this.authService.findAllUsers()
        for (const user of users) {
            let days_persent = 0
            let days_absent = 0
            let UndertimeHours = 0
            let OvertimeHours = 0
            const attendance_dayes = await this.attendanceService.filterAttendance(user.id, { startDate: oneMonthAgoDate, endDate: now })
            attendance_dayes?.forEach(day => {
                if (day.status === AttendanceStatus.PRESENT) {
                    const startDay: any = day.checkInTime
                    const endDay: any = day.checkOutTime
                    const workHour = (endDay?.getTime() - startDay?.getTime()) / 3600000
                    if (workHour > 8) {
                        OvertimeHours += workHour - 8
                    } else {
                        UndertimeHours += 8 - workHour

                    }
                    days_persent++
                } else {
                    days_absent++
                }
            })
            const userGroup = await this.groupRepository.findOne({ where: { id: user.groupId }, relations: { baseSalary: true } })
            if (!userGroup) {
                continue
            }
            const payOfDay = userGroup.baseSalary.baseSalary / 26
            const payOfhour = userGroup.baseSalary.baseSalary / (26 * 8)
            const deduction = (payOfhour * UndertimeHours)
            let bonuses = (payOfhour * OvertimeHours)
            const payrolle = this.payRolleRepository.create({
                user_id: user.id,
                pay_date: now,
                baseSalary: userGroup.baseSalary.baseSalary,
                deduction,
                bonuses,
                totalAmount: ((days_persent * payOfDay) + bonuses) - deduction
            })
            await this.payRolleRepository.save(payrolle)
        }
    }
    async getPayrollById(payrollId: number, userId: number) {
        const payroll = await this.payRolleRepository.findOne({
            where: {
                id: payrollId,
                user_id: userId,
            },
        });

        if (!payroll) {
            throw new NotFoundException('فیش حقوقی مورد نظر پیدا نشد');
        }

        return payroll;
    }
    async getUserPayrolls(userId: number, filter: PayrollFilterDto) {
        const query = this.payRolleRepository
            .createQueryBuilder('payroll')
            .where('payroll.user_id = :userId', { userId });

        if (filter.startDate) {
            query.andWhere('payroll.pay_date >= :startDate', {
                startDate: filter.startDate,
            });
        }

        if (filter.endDate) {
            query.andWhere('payroll.pay_date <= :endDate', {
                endDate: filter.endDate,
            });
        }

        return query
            .orderBy('payroll.pay_date', 'DESC')
            .getMany();
    }
}