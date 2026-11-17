import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BaseSalary } from "./baseSalary-group.entity";
import { USER } from "../../auth/entities/user.entity";


@Entity('groupes')
export class Group {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: "varchar" })
    name: string
    @Column()
    @Column()
    baseSalaryId: number;

    @ManyToOne(() => BaseSalary, (bs) => bs.groupes)
    @JoinColumn({
        name: 'baseSalaryId',
    })
    baseSalary: BaseSalary;
    @OneToMany(() => USER, (user) => user.group)
    users: USER[]
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}