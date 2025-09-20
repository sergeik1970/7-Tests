import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Test } from "../Test/test.entity";
// import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum UserRole {
    PARTICIPANT = "participant",
    CREATOR = "creator",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.PARTICIPANT,
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Связи
    @OneToMany(() => Test, (test) => test.creator)
    createdTests: Test[];

    // Временно убираем связь для упрощения
    // @OneToMany(() => TestAttempt, (attempt) => attempt.user)
    // testAttempts: TestAttempt[];
}
