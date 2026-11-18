import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('departments')
export class Departments{
    @PrimaryGeneratedColumn()
    id:number
    @Column({type:"varchar", length:100, unique:true})
    name:string
    @Column({type:"text", nullable:true})
    description:string
    @CreateDateColumn()
    created_at:Date
    @UpdateDateColumn()
    updated_at:Date
}