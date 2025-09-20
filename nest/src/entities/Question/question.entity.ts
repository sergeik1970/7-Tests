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
import { Test } from "../Test/test.entity";
import { QuestionOption } from "../QuestionOption/questionOption.entity";
// import { TestAnswer } from "../TestAnswer/testAnswer.entity";

export enum QuestionType {
    MULTIPLE_CHOICE = "multiple_choice",
    TEXT_INPUT = "text_input",
}

@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    text: string;

    @Column({
        type: "enum",
        enum: QuestionType,
    })
    type: QuestionType;

    @Column({ type: "int" })
    order: number; // порядок вопроса в тесте

    @Column({ type: "text", nullable: true })
    correctTextAnswer: string; // для текстовых вопросов

    @Column({ type: "int" })
    testId: number;

    @ManyToOne(() => Test, (test) => test.questions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "testId" })
    test: Test;

    @OneToMany(() => QuestionOption, (option) => option.question, {
        cascade: true,
    })
    options: QuestionOption[];

    // Убираем эту связь для упрощения базовой функциональности
    // @OneToMany(() => TestAnswer, (answer) => answer.question)
    // answers: TestAnswer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
