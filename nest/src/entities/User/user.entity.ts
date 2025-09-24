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
    // Id пользователя
    @PrimaryGeneratedColumn("increment")
    id: number;

    // Эл почта
    @Column({ unique: true })
    email: string;

    // Имя
    @Column()
    name: string;

    // Пароль
    @Column()
    password: string;

    // Роль
    @Column({
        //  Одно из заранее определенных значений
        type: "enum",
        // Значения, они в UserRole
        enum: UserRole,
        // По умолчанию ученик
        default: UserRole.PUPIL,
    })
    role: UserRole;

    // Даты создания и обновления
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Связи
    // Один пользователь связан с другими записями другой таблицы
    // В Test есть поле creator - это создатель тестов
    @OneToMany(() => Test, (test) => test.creator)
    // В createdTests будут записаны все созданные тесты
    createdTests: Test[];

    // Один пользователь может сделать несколько попыток на разных тестах
    // В TestAttempt есть поле user - это пользователь
    @OneToMany(() => TestAttempt, (attempt) => attempt.user)
    // В testAttempts будут записаны все попытки
    testAttempts: TestAttempt[];
}
