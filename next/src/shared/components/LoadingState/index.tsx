import React from "react";
import styles from "./index.module.scss";

export interface LoadingStateProps {
    message?: string;
    className?: string;
    size?: "small" | "medium" | "large";
}

const LoadingState: React.FC<LoadingStateProps> = ({
    message = "Загрузка...",
    className,
    size = "medium",
}) => {
    return (
        <div className={`${styles.loadingState} ${styles[size]} ${className || ""}`}>
            <div className={styles.spinner}>
                <div className={styles.spinnerInner}></div>
            </div>
            <p className={styles.message}>{message}</p>
        </div>
    );
};

export default LoadingState;
