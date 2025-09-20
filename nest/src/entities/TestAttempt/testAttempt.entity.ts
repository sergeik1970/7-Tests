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
    id: number;

    @Column({ type: "int" })
    userId: number;

    @Column({ type: "int" })
    testId: number;

    @Column({
        type: "enum",
        enum: AttemptStatus,
        default: AttemptStatus.IN_PROGRESS,
    })
    status: AttemptStatus;

    @Column({ type: "timestamp", nullable: true })
    startedAt: Date;

    @Column({ type: "timestamp", nullable: true })
    completedAt: Date;

    @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
    score: number; // процент правильных ответов

    @Column({ type: "int", nullable: true })
    correctAnswers: number;

    @Column({ type: "int", nullable: true })
    totalQuestions: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "userId" })
    user: User;

    @ManyToOne(() => Test)
    @JoinColumn({ name: "testId" })
    test: Test;

    @OneToMany(() => TestAnswer, (answer) => answer.attempt, { cascade: true })
    answers: TestAnswer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
