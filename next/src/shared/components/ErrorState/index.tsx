import React from "react";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";

export interface ErrorStateProps {
    title?: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    showIcon?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
    title = "Ошибка",
    message,
    actionLabel = "Вернуться к панели",
    onAction,
    className,
    showIcon = true
}) => {
    return (
        <div className={`${styles.errorState} ${className || ""}`}>
            {showIcon && (
                <div className={styles.icon}>
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
                        <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" strokeWidth="2" />
                        <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" strokeWidth="2" />
                    </svg>
                </div>
            )}
            
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>
            
            {onAction && (
                <Button onClick={onAction} variant="primary" className={styles.action}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

export default ErrorState;