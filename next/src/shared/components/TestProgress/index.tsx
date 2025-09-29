import React from "react";
import styles from "./index.module.scss";

interface TestProgressProps {
    currentQuestion: number;
    totalQuestions: number;
    className?: string;
}

const TestProgress: React.FC<TestProgressProps> = ({
    currentQuestion,
    totalQuestions,
    className = "",
}) => {
    const progressPercentage = (currentQuestion / totalQuestions) * 100;

    return (
        <div className={`${styles.progress} ${className}`}>
            <div className={styles.progressText}>
                Вопрос {currentQuestion} из {totalQuestions}
            </div>
            <div className={styles.progressBar}>
                <div 
                    className={styles.progressFill}
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default TestProgress;