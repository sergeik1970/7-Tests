import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from "typeorm";
import { User } from "../User/user.entity";
import { Test } from "../Test/test.entity";
import { TestAnswer } from "../TestAnswer/testAnswer.entity";

export enum AttemptStatus {
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ABANDONED = "abandoned",
}

@Entity("test_attempts")
export class TestAttempt {
    @PrimaryGeneratedColumn()
    // Id попытки
    id: number;

    // Id пользователя
    @Column({ type: "int" })
    userId: number;

    // Id теста
    @Column({ type: "int" })
    testId: number;

    // Статус попытки
    @Column({
        type: "enum",
        // Выбирать из этого массива
        enum: AttemptStatus,
        default: AttemptStatus.IN_PROGRESS,
    })
    status: AttemptStatus;

    // Время начала попытки
    @Column({ type: "timestamp", nullable: true })
    startedAt: Date;

    // Время окончания попытки
    @Column({ type: "timestamp", nullable: true })
    completedAt: Date;

    // Процент правильных ответов
    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    score: number;

    // Количество правильных ответов
    @Column({ type: "int", nullable: true })
    correctAnswers: number;

    // Количество вопросов
    @Column({ type: "int", nullable: true })
    totalQuestions: number;

    // Связь с пользователем
    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    // Связь с тестом
    @ManyToOne(() => Test)
    @JoinColumn({ name: "testId" })
    test: Test;

    // Связь с ответами
    @OneToMany(() => TestAnswer, (answer) => answer.attempt, { cascade: true })
    answers: TestAnswer[];

    // Даты
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
