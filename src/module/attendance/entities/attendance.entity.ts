import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { USER } from "../../auth/entities/user.entity";
import { AttendanceStatus } from "../enum/AttendanceStatus.enum";
@Unique(['workDate', 'user'])
@Entity('attendances')
export class Attendance {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: 'timestamptz', nullable: true })
    checkInTime: Date| null
    @Column({ type: 'timestamptz', nullable: true })
    checkOutTime: Date | null
    @Column({ type: "text", nullable: true })
    note: string | null
    @Column({ type: 'date' })
    workDate: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
    @Column()
    userId: number
    @Column({
        type: 'enum',
        enum: AttendanceStatus,
        default: AttendanceStatus.PRESENT
    })
    status: AttendanceStatus;
    @ManyToOne(() => USER, (user) => user.attendaces,{onDelete:"CASCADE"})
    @JoinColumn({ name: 'userId' })
    user: USER
}
