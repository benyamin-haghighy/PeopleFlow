import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Group } from "./group.entity";


@Entity('base_salary')
export class BaseSalary{
    @PrimaryGeneratedColumn()
    id:number
    @Column({type:"int"})
    baseSalary:number
    @OneToMany(()=>Group, (g)=>g.baseSalary)
    groupes:Group[]
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}