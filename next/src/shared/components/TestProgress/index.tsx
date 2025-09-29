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
    return (
        <div className={`${styles.progress} ${className}`}>
            <div className={styles.progressText}>
                Вопрос {currentQuestion} из {totalQuestions}
            </div>
        </div>
    );
};

export default TestProgress;
