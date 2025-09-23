import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from "typeorm";
import { Test } from "../Test/test.entity";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum UserRole {
    PUPIL = "pupil",
    TEACHER = "teacher",
    STUDENT = "student",
    PROFESSOR = "professor",
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
        default: UserRole.PUPIL,
    })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Связи
    @OneToMany(() => Test, (test) => test.creator)
    createdTests: Test[];

    @OneToMany(() => TestAttempt, (attempt) => attempt.user)
    testAttempts: TestAttempt[];
}
