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
import { Question } from "../Question/question.entity";
// import { TestAnswer } from "../TestAnswer/testAnswer.entity";

// Таблица с вариантами ответов на вопросы
@Entity("question_options")
export class QuestionOption {
    @PrimaryGeneratedColumn()
    // ID варианта ответа
    id: number;

    // Текст варианта ответа
    @Column({ type: "text" })
    text: string;

    // Правильный ли вариант ответа
    @Column({ type: "boolean", default: false })
    isCorrect: boolean;

    // Порядок вывода вариантов ответов
    @Column({ type: "int" })
    order: number;

    // ID вопроса, к которому относится вариант ответа
    @Column({ type: "int" })
    questionId: number;

    // Связь с вопросом
    @ManyToOne(() => Question, (question) => question.options, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "questionId" })
    question: Question;

    // Убираем эту связь, так как она не обязательна для базовой функциональности
    // @OneToMany(() => TestAnswer, (answer) => answer.selectedOption)
    // selectedInAnswers: TestAnswer[];

    // Даты создания и обновления записи
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
