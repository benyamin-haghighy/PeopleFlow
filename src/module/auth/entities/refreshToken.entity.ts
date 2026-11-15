import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { USER } from "./user.entity";


@Entity('refreshTokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number
    @Column({unique:true})
    user_id: number
    @Column()
    token: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
    @OneToOne(()=>USER, (user)=>user.refreshToken,{onDelete:'CASCADE'})
    @JoinColumn({
        name:"user_id"
    })
    user:USER
}