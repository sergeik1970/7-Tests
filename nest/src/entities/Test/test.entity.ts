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
import { Question } from "../Question/question.entity";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum TestStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
}

// Таблица с тестами
@Entity("tests")
export class Test {
    @PrimaryGeneratedColumn()
    // Id теста
    id: number;

    // Название теста
    @Column({ type: "varchar", length: 255 })
    title: string;

    // Описание теста
    @Column({ type: "text", nullable: true })
    description: string;

    // Время в минутах на тест
    @Column({ type: "int", nullable: true })
    timeLimit: number; // время в минутах

    // Статус теста
    @Column({
        type: "enum",
        // Выбирать из этого массива
        enum: TestStatus,
        default: TestStatus.DRAFT,
    })
    status: TestStatus;

    // Id пользователя, который создал тест
    @Column({ type: "int" })
    creatorId: number;

    // Связь с пользователем
    @ManyToOne(() => User, (user) => user.createdTests)
    @JoinColumn({ name: "creatorId" })
    creator: User;

    // Связь с вопросами
    @OneToMany(() => Question, (question) => question.test, { cascade: true })
    questions: Question[];

    // Связь с попытками
    @OneToMany(() => TestAttempt, (attempt) => attempt.test)
    attempts: TestAttempt[];

    // Даты
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
