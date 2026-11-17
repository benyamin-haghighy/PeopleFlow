import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import { Group } from '../entities/group.entity';
import { BaseSalary } from '../entities/baseSalary-group.entity';
import { CreateBaseSalaryDto } from '../dto/baseSalary.dto';
import { CreateGroupDto } from '../dto/group.dto';
import { PayrollFilterDto } from '../dto/payrolle-employee-filter.dto';
import { payrollStatus } from '../enums/payroll-status.enum';
import { Payroll } from '../entities/payroll.entity';
import { UpdatePayrollDto } from '../dto/payrolle-update.dto';

@Injectable()
export class ManagerService {

    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(Payroll)
        private readonly payRolleRepository: Repository<Payroll>,
        @InjectRepository(BaseSalary)
        private readonly baseSalaryRepository: Repository<BaseSalary>,
    ) { }

    async createBaseSalary(dto: CreateBaseSalaryDto) {
        const baseSalary = this.baseSalaryRepository.create({
            baseSalary: dto.baseSalary,
        });

        return this.baseSalaryRepository.save(baseSalary);
    }

    async createGroup(dto: CreateGroupDto) {

        const baseSalary = await this.baseSalaryRepository.findOne({
            where: {
                id: dto.baseSalaryId,
            },
        });

        if (!baseSalary) {
            throw new NotFoundException('پایه حقوق مورد نظر پیدا نشد');
        }

        const group = this.groupRepository.create({
            name: dto.name,
            baseSalaryId: dto.baseSalaryId,
        });

        return this.groupRepository.save(group);
    }
    async getGroups() {
        return this.groupRepository.find({
            relations: {
                baseSalary: true,
            },
            select: {
                id: true,
                name: true,
                baseSalary: {
                    id: true,
                    baseSalary: true,
                },
            },
        });
    }
    async updateGroupBaseSalary(groupId: number, baseSalaryId: number) {

        const group = await this.groupRepository.findOne({
            where: { id: groupId },
        });

        if (!group) {
            throw new NotFoundException('گروه مورد نظر پیدا نشد');
        }

        const baseSalary = await this.baseSalaryRepository.findOne({
            where: { id: baseSalaryId },
        });

        if (!baseSalary) {
            throw new NotFoundException('پایه حقوق مورد نظر پیدا نشد');
        }

        group.baseSalary = baseSalary;

        return this.groupRepository.save(group);
    }
    async payRollesFilter(
        filter: PayrollFilterDto,
        status?: payrollStatus,
    ) {
        const query = this.payRolleRepository
            .createQueryBuilder('payroll');

        if (status) {
            query.andWhere('payroll.status = :status', { status });
        }

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
            .orderBy('payroll.id', 'DESC')
            .getMany();
    }
    async getPayrollById(id: number) {
        const payroll = await this.payRolleRepository.findOne({
            where: { id },
        });

        if (!payroll) {
            throw new NotFoundException('فیش حقوقی مورد نظر پیدا نشد');
        }

        return payroll;
    }
    async updatePayroll(id: number, dto: UpdatePayrollDto) {
        const payroll = await this.payRolleRepository.findOne({
            where: { id },
        });

        if (!payroll) {
            throw new NotFoundException('فیش حقوقی مورد نظر پیدا نشد');
        }

        if (dto.bonuses !== undefined) {
            const difference = dto.bonuses - payroll.bonuses;

            payroll.bonuses = dto.bonuses;
            payroll.totalAmount += difference;
        }

        if (dto.deduction !== undefined) {
            const difference = dto.deduction - payroll.deduction;

            payroll.deduction = dto.deduction;
            payroll.totalAmount -= difference;
        }

        if (dto.note !== undefined) {
            payroll.note = dto.note;
        }

        if (dto.status !== undefined) {
            payroll.status = dto.status;

            if (dto.status === payrollStatus.PAYED) {
                payroll.payment_date = new Date();
            }
        }

        return this.payRolleRepository.save(payroll);
    }
}