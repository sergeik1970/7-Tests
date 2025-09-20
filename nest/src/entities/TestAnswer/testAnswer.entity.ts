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
    id: number;

    @Column({ type: "int" })
    attemptId: number;

    @Column({ type: "int" })
    questionId: number;

    @Column({ type: "int", nullable: true })
    selectedOptionId: number; // для вопросов с выбором

    @Column({ type: "text", nullable: true })
    textAnswer: string; // для текстовых вопросов

    @Column({ type: "boolean", nullable: true })
    isCorrect: boolean; // результат проверки ответа

    @ManyToOne(() => TestAttempt, (attempt) => attempt.answers, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "attemptId" })
    attempt: TestAttempt;

    // Временно убираем связь для упрощения
    // @ManyToOne(() => Question, (question) => question.answers)
    // @JoinColumn({ name: "questionId" })
    // question: Question;

    @ManyToOne(() => QuestionOption, {
        nullable: true,
    })
    @JoinColumn({ name: "selectedOptionId" })
    selectedOption: QuestionOption;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
