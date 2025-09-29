import React from "react";
import SavingStatus from "@/shared/components/SavingStatus";
import type { Question } from "@/services/api";
import styles from "./index.module.scss";

export interface QuestionDisplayProps {
    /** Данные вопроса */
    question: Question;
    /** Текущие ответы пользователя */
    answers: {
        selectedOptionIds?: number[];
        textAnswer?: string;
    };
    /** Обработчик изменения ответа */
    onAnswerChange: (
        selectedOptionId?: number,
        selectedOptionIds?: number[],
        textAnswer?: string,
    ) => void;
    /** Статус сохранения */
    savingStatus?: "saved" | "saving" | "error";
    /** Показывать ли отладочную информацию */
    showDebugInfo?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    answers,
    onAnswerChange,
    savingStatus,
    showDebugInfo = false,
}) => {
    const currentAnswers = answers.selectedOptionIds || [];
    const correctAnswers = question.options?.filter((opt) => opt.isCorrect) || [];
    const correctAnswersCount = correctAnswers.length;

    return (
        <div className={styles.questionCard}>
            <h2 className={styles.questionText}>{question.text}</h2>

            {(question.type === "single_choice" || question.type === "multiple_choice") &&
                question.options &&
                question.options.length > 0 && (
                    <div className={styles.options}>
                        {question.type === "multiple_choice" && (
                            <div className={styles.choiceHint}>
                                Выберите несколько вариантов ответа
                            </div>
                        )}

                        {showDebugInfo && (
                            <div className={styles.debugInfo}>
                                <strong>DEBUG INFO:</strong>
                                <br />
                                questionType = "{question.type}" <br />
                                questionId = {question.id} <br />
                                selectedAnswersCount = {currentAnswers.length} <br />
                                correctAnswersCount = {correctAnswersCount} <br />
                                optionsLength = {question.options?.length || 0} <br />
                                hasOptions = {question.options ? "true" : "false"} <br />
                                Correct answers:{" "}
                                {correctAnswers.map((opt) => opt.text).join(", ") || "none"} <br />
                                All options:{" "}
                                {question.options
                                    ?.map((opt) => `${opt.text}(${opt.isCorrect ? "✓" : "✗"})`)
                                    .join(", ") || "NO OPTIONS"}{" "}
                                <br />
                                Input type will be:{" "}
                                {question.type === "multiple_choice" ? "checkbox" : "radio"}
                            </div>
                        )}

                        {question.options.map((option, index) => (
                            <label key={index} className={styles.optionLabel}>
                                <input
                                    type={
                                        question.type === "multiple_choice" ? "checkbox" : "radio"
                                    }
                                    name={
                                        question.type === "multiple_choice"
                                            ? undefined
                                            : `question-${question.id}`
                                    }
                                    value={option.id}
                                    checked={currentAnswers.includes(option.id!)}
                                    onChange={() => onAnswerChange(option.id)}
                                />
                                <span className={styles.optionText}>{option.text}</span>
                            </label>
                        ))}
                    </div>
                )}

            {/* Отладочная информация для случаев, когда варианты не показываются */}
            {(question.type === "single_choice" || question.type === "multiple_choice") &&
                (!question.options || question.options.length === 0) && (
                    <div className={styles.errorInfo}>
                        <strong>⚠️ ПРОБЛЕМА: Варианты ответов не найдены!</strong>
                        <br />
                        questionType = "{question.type}" <br />
                        hasOptions = {question.options ? "true" : "false"} <br />
                        optionsLength = {question.options?.length || 0} <br />
                        options = {JSON.stringify(question.options)}
                    </div>
                )}

            {question.type === "text_input" && (
                <div className={styles.textInput}>
                    <textarea
                        value={answers.textAnswer || ""}
                        onChange={(e) => onAnswerChange(undefined, undefined, e.target.value)}
                        placeholder="Введите ваш ответ..."
                        rows={4}
                    />
                </div>
            )}

            {/* Индикатор сохранения */}
            {savingStatus && <SavingStatus status={savingStatus} />}
        </div>
    );
};

export default QuestionDisplay;