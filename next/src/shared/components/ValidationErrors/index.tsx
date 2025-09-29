import React from "react";
import styles from "./index.module.scss";

interface ValidationErrorsProps {
    errors: string[];
    title?: string;
    variant?: "error" | "warning";
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({
    errors,
    title = "Исправьте следующие ошибки:",
    variant = "error",
}) => {
    if (errors.length === 0) {
        return null;
    }

    return (
        <div className={`${styles.validationErrors} ${styles[variant]}`}>
            <h3>{title}</h3>
            <ul>
                {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </div>
    );
};

export default ValidationErrors;
