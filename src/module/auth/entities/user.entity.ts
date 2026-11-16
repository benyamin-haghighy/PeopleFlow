import { Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Role } from "../../../shared/enums/user-role.enum";
import { RefreshToken } from "./refreshToken.entity";
import { Attendance } from "../../attendance/entities/attendance.entity";


@Entity('users')
export class USER {
    @PrimaryGeneratedColumn()
    id: number
    @Column()
    name: string
    @Column({ unique: true })
    phone: string
    @Column()
    password: string
    @Column({ type: "enum", enum: Role, default: Role.EMPLOYE })
    role: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
    @OneToOne(()=>RefreshToken, (r)=>r.user)
    refreshToken:RefreshToken
    @OneToMany(()=>Attendance, (ad)=>ad.user)
    attendaces:Attendance[]
}