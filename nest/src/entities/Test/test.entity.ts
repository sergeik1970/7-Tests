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
// import { TestAttempt } from "../TestAttempt/testAttempt.entity";

export enum TestStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    COMPLETED = "completed",
}

@Entity("tests")
export class Test {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "int", nullable: true })
    timeLimit: number; // время в минутах

    @Column({
        type: "enum",
        enum: TestStatus,
        default: TestStatus.DRAFT,
    })
    status: TestStatus;

    @Column({ type: "int" })
    creatorId: number;

    @ManyToOne(() => User, (user) => user.createdTests)
    @JoinColumn({ name: "creatorId" })
    creator: User;

    @OneToMany(() => Question, (question) => question.test, { cascade: true })
    questions: Question[];

    // Временно убираем связь для упрощения базовой функциональности
    // @OneToMany(() => TestAttempt, (attempt) => attempt.test)
    // attempts: TestAttempt[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
