import React from "react";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import QuestionOption, { QuestionOptionData } from "@/shared/components/QuestionOption";
import styles from "./index.module.scss";

export interface QuestionData {
    text: string;
    type: "single_choice" | "multiple_choice" | "text";
    order: number;
    correctTextAnswer?: string;
    options?: QuestionOptionData[];
}

interface QuestionProps {
    question: QuestionData;
    questionIndex: number;
    onQuestionChange: (field: keyof QuestionData, value: any) => void;
    onOptionTextChange: (optionIndex: number, text: string) => void;
    onToggleCorrectOption: (optionIndex: number) => void;
    onOptionKeyDown: (optionIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
    onRemoveQuestion: () => void;
    disabled?: boolean;
}

const Question: React.FC<QuestionProps> = ({
    question,
    questionIndex,
    onQuestionChange,
    onOptionTextChange,
    onToggleCorrectOption,
    onOptionKeyDown,
    onRemoveQuestion,
    disabled = false,
}) => {
    const getCorrectAnswersCount = (): number => {
        return question.options?.filter((opt) => opt.isCorrect).length || 0;
    };

    const getNonEmptyOptionsCount = (): number => {
        return question.options?.filter((opt) => opt.text.trim() !== "").length || 0;
    };

    const hasCorrectAnswer = (): boolean => {
        return question.options?.some((opt) => opt.isCorrect) || false;
    };

    const handleTypeChange = (newType: "single_choice" | "multiple_choice" | "text") => {
        onQuestionChange("type", newType);

        if (newType === "text") {
            onQuestionChange("options", undefined);
            onQuestionChange("correctTextAnswer", "");
        } else if (newType === "single_choice" || newType === "multiple_choice") {
            onQuestionChange("correctTextAnswer", undefined);
            onQuestionChange("options", [
                { text: "", isCorrect: false, order: 0 },
                { text: "", isCorrect: false, order: 1 },
            ]);
        }
    };

    return (
        <div className={styles.questionCard}>
            <div className={styles.questionHeader}>
                <h3 className={styles.questionTitle}>Вопрос {questionIndex + 1}</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="small"
                    onClick={onRemoveQuestion}
                    disabled={disabled}
                >
                    Удалить
                </Button>
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Текст вопроса *</label>
                <textarea
                    className={styles.textarea}
                    value={question.text}
                    onChange={(e) => onQuestionChange("text", e.target.value)}
                    placeholder="Введите текст вопроса"
                    required
                    disabled={disabled}
                    rows={2}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Тип вопроса</label>
                <select
                    className={styles.select}
                    value={question.type}
                    onChange={(e) =>
                        handleTypeChange(
                            e.target.value as "single_choice" | "multiple_choice" | "text",
                        )
                    }
                    disabled={disabled}
                >
                    <option value="single_choice">Одиночный выбор</option>
                    <option value="multiple_choice">Множественный выбор</option>
                    <option value="text">Текстовый ответ</option>
                </select>
            </div>

            {(question.type === "single_choice" || question.type === "multiple_choice") &&
                question.options && (
                    <div className={styles.options}>
                        <label className={styles.label}>Варианты ответов</label>
                        {question.options.map((option, optionIndex) => (
                            <QuestionOption
                                key={optionIndex}
                                option={option}
                                optionIndex={optionIndex}
                                questionIndex={questionIndex}
                                questionType={question.type}
                                onTextChange={(text) => onOptionTextChange(optionIndex, text)}
                                onToggleCorrect={() => onToggleCorrectOption(optionIndex)}
                                onKeyDown={(e) => onOptionKeyDown(optionIndex, e)}
                                required={optionIndex < 2}
                                disabled={disabled}
                            />
                        ))}
                        <small className={styles.hint}>
                            {question.type === "single_choice"
                                ? "Нажмите на кружок рядом с единственным правильным ответом."
                                : "Нажмите на квадратики рядом с правильными ответами. Можно выбрать несколько."}{" "}
                            Новые варианты добавляются автоматически при заполнении (до 10
                            вариантов). Используйте стрелки ↑↓ для навигации между вариантами.
                            {getCorrectAnswersCount() > 0 && (
                                <span className={styles.multipleAnswers}>
                                    <br />✓ Выбрано правильных ответов: {getCorrectAnswersCount()}{" "}
                                    из {getNonEmptyOptionsCount()}
                                </span>
                            )}
                            {!hasCorrectAnswer() && (
                                <span className={styles.noAnswers}>
                                    <br />
                                    ⚠️ Не выбран ни один правильный ответ
                                </span>
                            )}
                        </small>
                    </div>
                )}

            {question.type === "text" && (
                <div className={styles.field}>
                    <label className={styles.label}>Правильный ответ *</label>
                    <InputText
                        value={question.correctTextAnswer || ""}
                        onChange={(e) => onQuestionChange("correctTextAnswer", e.target.value)}
                        placeholder="Введите правильный ответ"
                        required
                        disabled={disabled}
                    />
                    <small className={styles.hint}>
                        Ответ будет проверяться без учета регистра и лишних пробелов
                    </small>
                </div>
            )}
        </div>
    );
};

export default Question;
