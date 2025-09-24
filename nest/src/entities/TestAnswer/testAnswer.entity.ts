import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { TestAttempt } from "../TestAttempt/testAttempt.entity";
import { Question } from "../Question/question.entity";
import { QuestionOption } from "../QuestionOption/questionOption.entity";

@Entity("test_answers")
export class TestAnswer {
    @PrimaryGeneratedColumn()
    // Id ответа на вопрос
    id: number;

    // Id попытки теста
    @Column({ type: "int" })
    attemptId: number;

    // Id вопроса
    @Column({ type: "int" })
    questionId: number;

    // Id выбранного варианта ответа
    @Column({ type: "int", nullable: true })
    selectedOptionId: number;

    // Ответ текстом
    @Column({ type: "text", nullable: true })
    textAnswer: string;

    // Верный ли ответ
    @Column({ type: "boolean", nullable: true })
    isCorrect: boolean;

    // Связь с попыткой
    @ManyToOne(() => TestAttempt, (attempt) => attempt.answers, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "attemptId" })
    attempt: TestAttempt;

    // Связь с вопросом
    @ManyToOne(() => Question, (question) => question.answers)
    @JoinColumn({ name: "questionId" })
    question: Question;

    // Связь с вариантами ответа
    @ManyToOne(() => QuestionOption, {
        nullable: true,
    })
    @JoinColumn({ name: "selectedOptionId" })
    selectedOption: QuestionOption;

    // Даты
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
