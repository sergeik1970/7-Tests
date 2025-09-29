import React from "react";
import Button from "@/shared/components/Button";
import Question, { QuestionData } from "@/shared/components/Question";
import { QuestionOptionData } from "@/shared/components/QuestionOption";
import styles from "./index.module.scss";

export type { QuestionData };

interface QuestionsProps {
    questions: QuestionData[];
    onChange: (questions: QuestionData[]) => void;
    disabled?: boolean;
}

const Questions: React.FC<QuestionsProps> = ({ questions, onChange, disabled = false }) => {
    // Добавление нового вопроса
    const handleAddQuestion = () => {
        const newQuestion: QuestionData = {
            text: "",
            type: "single_choice",
            order: questions.length,
            options: [
                { text: "", isCorrect: false, order: 0 },
                { text: "", isCorrect: false, order: 1 },
            ],
        };
        onChange([...questions, newQuestion]);
    };

    // Удаление вопроса
    const handleRemoveQuestion = (questionIndex: number) => {
        const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
        // Обновляем порядковые номера
        const reorderedQuestions = updatedQuestions.map((question, index) => ({
            ...question,
            order: index,
        }));
        onChange(reorderedQuestions);
    };

    // Изменение вопроса
    const handleQuestionChange = (questionIndex: number, field: keyof QuestionData, value: any) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            [field]: value,
        };

        // Если изменился тип вопроса, обновляем опции
        if (field === "type") {
            if (value === "text") {
                updatedQuestions[questionIndex].options = undefined;
                updatedQuestions[questionIndex].correctTextAnswer = "";
            } else {
                updatedQuestions[questionIndex].correctTextAnswer = undefined;
                if (!updatedQuestions[questionIndex].options) {
                    updatedQuestions[questionIndex].options = [
                        { text: "", isCorrect: false, order: 0 },
                        { text: "", isCorrect: false, order: 1 },
                    ];
                }
            }
        }

        onChange(updatedQuestions);
    };

    // Изменение текста опции
    const handleOptionTextChange = (questionIndex: number, optionIndex: number, text: string) => {
        const updatedQuestions = [...questions];
        if (updatedQuestions[questionIndex].options) {
            updatedQuestions[questionIndex].options![optionIndex] = {
                ...updatedQuestions[questionIndex].options![optionIndex],
                text,
            };
            onChange(updatedQuestions);
        }
    };

    // Переключение правильности опции
    const handleToggleCorrectOption = (questionIndex: number, optionIndex: number) => {
        const updatedQuestions = [...questions];
        const question = updatedQuestions[questionIndex];

        if (question.options) {
            // Для одиночного выбора сначала сбрасываем все остальные
            if (question.type === "single_choice") {
                question.options.forEach((opt, idx) => {
                    opt.isCorrect = idx === optionIndex;
                });
            } else {
                // Для множественного выбора просто переключаем
                question.options[optionIndex].isCorrect = !question.options[optionIndex].isCorrect;
            }
            onChange(updatedQuestions);
        }
    };

    // Обработка нажатия клавиш в опциях
    const handleOptionKeyDown = (
        questionIndex: number,
        optionIndex: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const question = questions[questionIndex];

            if (question.options && optionIndex === question.options.length - 1) {
                // Добавляем новую опцию
                const updatedQuestions = [...questions];
                updatedQuestions[questionIndex].options!.push({
                    text: "",
                    isCorrect: false,
                    order: question.options?.length || 0,
                });
                onChange(updatedQuestions);

                // Фокусируемся на новом поле через небольшую задержку
                setTimeout(() => {
                    const newIndex = question.options?.length || 0;
                    const newInput = document.querySelector(
                        `input[data-question="${questionIndex}"][data-option="${newIndex}"]`,
                    ) as HTMLInputElement;
                    if (newInput) {
                        newInput.focus();
                    }
                }, 50);
            } else {
                // Переходим к следующему полю
                const nextInput = document.querySelector(
                    `input[data-question="${questionIndex}"][data-option="${optionIndex + 1}"]`,
                ) as HTMLInputElement;
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Вопросы</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddQuestion}
                    disabled={disabled}
                >
                    Добавить вопрос
                </Button>
            </div>

            {questions.map((question, questionIndex) => (
                <Question
                    key={questionIndex}
                    question={question}
                    questionIndex={questionIndex}
                    onQuestionChange={(field, value) =>
                        handleQuestionChange(questionIndex, field, value)
                    }
                    onOptionTextChange={(optionIndex, text) =>
                        handleOptionTextChange(questionIndex, optionIndex, text)
                    }
                    onToggleCorrectOption={(optionIndex) =>
                        handleToggleCorrectOption(questionIndex, optionIndex)
                    }
                    onOptionKeyDown={(optionIndex, e) =>
                        handleOptionKeyDown(questionIndex, optionIndex, e)
                    }
                    onRemoveQuestion={() => handleRemoveQuestion(questionIndex)}
                    disabled={disabled}
                />
            ))}

            {questions.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Пока нет вопросов. Добавьте первый вопрос для начала.</p>
                </div>
            )}

            {questions.length > 0 && (
                <div className={styles.addQuestionBottom}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddQuestion}
                        disabled={disabled}
                    >
                        Добавить еще вопрос
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Questions;
