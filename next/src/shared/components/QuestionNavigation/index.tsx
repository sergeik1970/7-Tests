import React from "react";
import Button from "@/shared/components/Button";
import QuestionIndicators from "@/shared/components/QuestionIndicators";
import styles from "./index.module.scss";

export interface QuestionNavigationProps {
    /** Общее количество вопросов */
    totalQuestions: number;
    /** Индекс текущего вопроса (начиная с 0) */
    currentQuestionIndex: number;
    /** Функция для проверки, отвечен ли вопрос по индексу */
    isQuestionAnswered: (questionIndex: number) => boolean;
    /** Callback при переходе к предыдущему вопросу */
    onPrevious: () => void;
    /** Callback при переходе к следующему вопросу */
    onNext: () => void;
    /** Callback при выборе конкретного вопроса */
    onQuestionSelect: (questionIndex: number) => void;
    /** Callback при завершении теста */
    onComplete: () => void;
    /** Состояние загрузки при завершении */
    isCompleting?: boolean;
    /** Отключить все взаимодействие */
    disabled?: boolean;
    /** Дополнительные CSS классы */
    className?: string;
    /** Текст для кнопки "Предыдущий" */
    previousButtonText?: string;
    /** Текст для кнопки "Следующий" */
    nextButtonText?: string;
    /** Текст для кнопки "Завершить" */
    completeButtonText?: string;
    /** Текст для кнопки "Завершить" в состоянии загрузки */
    completingButtonText?: string;
}

const QuestionNavigation: React.FC<QuestionNavigationProps> = ({
    totalQuestions,
    currentQuestionIndex,
    isQuestionAnswered,
    onPrevious,
    onNext,
    onQuestionSelect,
    onComplete,
    isCompleting = false,
    disabled = false,
    className,
    previousButtonText = "Предыдущий",
    nextButtonText = "Следующий",
    completeButtonText = "Завершить тест",
    completingButtonText = "Завершение...",
}) => {
    const isFirstQuestion = currentQuestionIndex === 0;
    const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

    return (
        <div className={`${styles.navigation} ${className || ""}`}>
            {/* Кнопка "Предыдущий" */}
            <Button
                variant="outline"
                onClick={onPrevious}
                disabled={isFirstQuestion || disabled || isCompleting}
                className={styles.navigationButton}
            >
                {previousButtonText}
            </Button>

            {/* Индикаторы вопросов */}
            <QuestionIndicators
                totalQuestions={totalQuestions}
                currentQuestionIndex={currentQuestionIndex}
                isQuestionAnswered={isQuestionAnswered}
                onQuestionSelect={onQuestionSelect}
                disabled={disabled || isCompleting}
                className={styles.indicators}
            />

            {/* Кнопка "Следующий" или "Завершить" */}
            {!isLastQuestion ? (
                <Button
                    variant="primary"
                    onClick={onNext}
                    disabled={disabled || isCompleting}
                    className={styles.navigationButton}
                >
                    {nextButtonText}
                </Button>
            ) : (
                <Button
                    variant="primary"
                    onClick={onComplete}
                    disabled={disabled || isCompleting}
                    className={styles.navigationButton}
                >
                    {isCompleting ? completingButtonText : completeButtonText}
                </Button>
            )}
        </div>
    );
};

export default QuestionNavigation;
