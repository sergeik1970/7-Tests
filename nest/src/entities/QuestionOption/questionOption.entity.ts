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

@Entity("question_options")
export class QuestionOption {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text" })
    text: string;

    @Column({ type: "boolean", default: false })
    isCorrect: boolean;

    @Column({ type: "int" })
    order: number; // порядок варианта ответа

    @Column({ type: "int" })
    questionId: number;

    @ManyToOne(() => Question, (question) => question.options, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "questionId" })
    question: Question;

    // Убираем эту связь, так как она не обязательна для базовой функциональности
    // @OneToMany(() => TestAnswer, (answer) => answer.selectedOption)
    // selectedInAnswers: TestAnswer[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
