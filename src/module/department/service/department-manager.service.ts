import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import { Departments } from '../entities/department.entity'
import { CreateDepartmentDto } from '../dto/create-department.dto'
import { UpdateDepartmentDto } from '../dto/update-department.dto'

@Injectable()
export class DepartmentManageService {
    constructor(
        @InjectRepository(Departments)
        private readonly departmentRepository: Repository<Departments>,
    ) {}

    async create(dto: CreateDepartmentDto) {
        const exists = await this.departmentRepository.exists({ where: { name: dto.name } })
        if (exists) {
            throw new ConflictException('دپارتمانی با این نام وجود دارد')
        }
        const department = this.departmentRepository.create(dto)
        return this.departmentRepository.save(department)
    }

    findAll() {
        return this.departmentRepository.find({ order: { id: 'DESC' } })
    }

    async findOne(id: number) {
        const department = await this.departmentRepository.findOne({ where: { id } })
        if (!department) {
            throw new NotFoundException('دپارتمانی با این شناسه پیدا نشد')
        }
        return department
    }

    async update(id: number, dto: UpdateDepartmentDto) {
        const department = await this.findOne(id)

        if (dto.name && dto.name !== department.name) {
            const duplicate = await this.departmentRepository.exists({
                where: { name: dto.name, id: Not(id) },
            })
            if (duplicate) {
                throw new ConflictException('دپارتمانی با این نام وجود دارد')
            }
        }

        Object.assign(department, dto)
        return this.departmentRepository.save(department)
    }

    async remove(id: number) {
        await this.findOne(id)
        await this.departmentRepository.delete(id)
        return { message: 'دپارتمان حذف شد' }
    }
}