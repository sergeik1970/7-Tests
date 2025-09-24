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
import { TestAnswer } from "../TestAnswer/testAnswer.entity";

export enum QuestionType {
    SINGLE_CHOICE = "single_choice",
    MULTIPLE_CHOICE = "multiple_choice",
    TEXT_INPUT = "text_input",
}

// Таблица с вопросами с названием questions
@Entity("questions")
export class Question {
    @PrimaryGeneratedColumn()
    // Id вопроса
    id: number;

    // Текст вопроса
    @Column({ type: "text" })
    text: string;

    // Тип вопроса, выбор из вариантов
    @Column({
        type: "enum",
        // Они написаны в QuestionType
        enum: QuestionType,
    })
    // Тип вопроса
    type: QuestionType;

    // Порядок вопроса в тесте
    @Column({ type: "int" })
    order: number;

    // Ответ на текстовый вопрос
    @Column({ type: "text", nullable: true })
    correctTextAnswer: string;

    // Id теста
    @Column({ type: "int" })
    testId: number;

    // Много вопросов относится к одному тесту
    // При удалении теста удаляются и вопросы
    @ManyToOne(() => Test, (test) => test.questions, { onDelete: "CASCADE" })
    @JoinColumn({ name: "testId" })
    test: Test;

    // Вопрос может иметь несколько вариантов ответа
    @OneToMany(() => QuestionOption, (option) => option.question, {
        cascade: true,
    })
    // Варианты ответа для вопроса в таблице QuestionOption
    options: QuestionOption[];

    // Один вопрос - много ответов пользователей
    @OneToMany(() => TestAnswer, (answer) => answer.question)
    answers: TestAnswer[];

    // Даты
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
