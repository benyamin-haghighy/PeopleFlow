import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { USER } from "../../auth/entities/user.entity";
import { payrollStatus } from "../enums/payroll-status.enum";
@Unique(['user_id','pay_date'])
@Entity('payroll')
export class Payroll {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    user_id: number
    @ManyToOne(() => USER, (user) => user.payrolles)
    @JoinColumn({
        name: "user_id"
    })
    user: USER
    @Column({ type: "date" })
    pay_date: Date
    @Column({ type: 'int' })
    baseSalary: number;
    @Column({ type: 'int', default: 0 })
    bonuses: number;

    @Column({ type: 'int', default: 0 })
    deduction: number;

    @Column({ type: 'int' })
    totalAmount: number;
    @Column({ type: "enum", enum: payrollStatus, default: payrollStatus.PENDING })
    status: payrollStatus
    @Column({ type: "timestamp", nullable: true })
    payment_date: Date | null
    @Column({ type: "text", nullable: true })
    note: string | null
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}
