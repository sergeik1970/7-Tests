import React, { useState } from "react";
import styles from "./index.module.scss";

interface ValidationError {
    field: string;
    message: string;
    questionIndex?: number;
}

interface FloatingValidationProps {
    errors: ValidationError[];
    isFormValid: boolean;
}

const FloatingValidation: React.FC<FloatingValidationProps> = ({ errors, isFormValid }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const hasErrors = errors.length > 0;
    const status = isFormValid && !hasErrors ? "success" : "error";

    return (
        <div className={`${styles.floatingWidget} ${styles[status]}`}>
            {/* Свернутое состояние */}
            <div className={styles.collapsed} onClick={toggleExpanded}>
                <div className={styles.indicator}>
                    {hasErrors ? (
                        <span className={styles.errorCount}>{errors.length}</span>
                    ) : (
                        <span className={styles.successIcon}>✓</span>
                    )}
                </div>
                <button className={styles.expandButton} type="button">
                    <span className={`${styles.arrow} ${isExpanded ? styles.expanded : ""}`}>
                        ▶
                    </span>
                </button>
            </div>

            {/* Развернутое состояние */}
            {isExpanded && (
                <div className={styles.expanded}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>
                            {hasErrors ? "Проблемы в тесте" : "Тест готов"}
                        </h3>
                        <button
                            className={styles.closeButton}
                            onClick={toggleExpanded}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    <div className={styles.content}>
                        {hasErrors ? (
                            <ul className={styles.errorList}>
                                {errors.map((error, index) => (
                                    <li key={index} className={styles.errorItem}>
                                        <span className={styles.errorField}>
                                            {error.questionIndex !== undefined
                                                ? `Вопрос ${error.questionIndex + 1}`
                                                : error.field}
                                            :
                                        </span>
                                        <span className={styles.errorMessage}>{error.message}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className={styles.successMessage}>
                                <span className={styles.successIcon}>✓</span>
                                <p>Все поля заполнены корректно. Тест готов к публикации!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingValidation;
