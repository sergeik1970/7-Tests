import React from "react";
import styles from "./index.module.scss";

export interface QuestionIndicatorsProps {
    /** Общее количество вопросов */
    totalQuestions: number;
    /** Индекс текущего вопроса (начиная с 0) */
    currentQuestionIndex: number;
    /** Функция для проверки, отвечен ли вопрос по индексу */
    isQuestionAnswered: (questionIndex: number) => boolean;
    /** Callback при клике на индикатор вопроса */
    onQuestionSelect: (questionIndex: number) => void;
    /** Дополнительные CSS классы */
    className?: string;
    /** Отключить взаимодействие */
    disabled?: boolean;
}

const QuestionIndicators: React.FC<QuestionIndicatorsProps> = ({
    totalQuestions,
    currentQuestionIndex,
    isQuestionAnswered,
    onQuestionSelect,
    className,
    disabled = false,
}) => {
    return (
        <div className={`${styles.questionIndicators} ${className || ""}`}>
            {Array.from({ length: totalQuestions }, (_, index) => (
                <button
                    key={index}
                    className={`${styles.indicator} ${
                        index === currentQuestionIndex ? styles.current : ""
                    } ${isQuestionAnswered(index) ? styles.answered : ""}`}
                    onClick={() => !disabled && onQuestionSelect(index)}
                    disabled={disabled}
                    type="button"
                    aria-label={`Перейти к вопросу ${index + 1}${
                        isQuestionAnswered(index) ? " (отвечен)" : ""
                    }${index === currentQuestionIndex ? " (текущий)" : ""}`}
                >
                    {index + 1}
                </button>
            ))}
        </div>
    );
};

export default QuestionIndicators;