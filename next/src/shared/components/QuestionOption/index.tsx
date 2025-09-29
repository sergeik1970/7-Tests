import React from "react";
import InputText from "@/shared/components/InputText";
import styles from "./index.module.scss";

export interface QuestionOptionData {
    text: string;
    isCorrect: boolean;
    order: number;
}

interface QuestionOptionProps {
    /** Данные варианта ответа */
    option: QuestionOptionData;
    /** Индекс варианта в списке */
    optionIndex: number;
    /** Индекс вопроса */
    questionIndex: number;
    /** Тип вопроса для определения вида чекбокса/радио */
    questionType: "single_choice" | "multiple_choice";
    /** Обработчик изменения текста варианта */
    onTextChange: (text: string) => void;
    /** Обработчик переключения правильности ответа */
    onToggleCorrect: () => void;
    /** Обработчик нажатия клавиш для навигации */
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Заблокирован ли компонент */
    disabled?: boolean;
    /** Обязательное ли поле */
    required?: boolean;
}

const QuestionOption: React.FC<QuestionOptionProps> = ({
    option,
    optionIndex,
    questionIndex,
    questionType,
    onTextChange,
    onToggleCorrect,
    onKeyDown,
    disabled = false,
    required = false,
}) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onTextChange(e.target.value);
    };

    const isRadio = questionType === "single_choice";
    const isCheckbox = questionType === "multiple_choice";

    return (
        <div className={styles.option}>
            <div
                className={`
                    ${isCheckbox ? styles.customCheckbox : styles.customRadio} 
                    ${option.isCorrect ? styles.checked : ""} 
                    ${!option.text.trim() ? styles.disabled : ""}
                `}
                onClick={onToggleCorrect}
                role="button"
                tabIndex={0}
                aria-label={`Отметить вариант ${optionIndex + 1} как ${option.isCorrect ? "неправильный" : "правильный"}`}
            >
                {option.isCorrect && (
                    <div className={isCheckbox ? styles.checkboxInner : styles.radioInner} />
                )}
            </div>
            <InputText
                value={option.text}
                onChange={handleTextChange}
                onKeyDown={onKeyDown}
                placeholder={`Вариант ${optionIndex + 1}`}
                required={required}
                disabled={disabled}
                data-question={questionIndex}
                data-option={optionIndex}
            />
        </div>
    );
};

export default QuestionOption;
