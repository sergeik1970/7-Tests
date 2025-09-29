import React from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import type { TestAttempt } from "@/services/api";
import styles from "./TestResults.module.scss";

interface TestResultsProps {
    attempt: TestAttempt;
    testId?: string | string[];
}

const TestResults: React.FC<TestResultsProps> = ({ attempt, testId }) => {
    const router = useRouter();

    const getScoreColor = (score: number) => {
        if (score >= 80) return styles.excellent;
        if (score >= 60) return styles.good;
        if (score >= 40) return styles.fair;
        return styles.poor;
    };

    const getScoreText = (score: number) => {
        if (score >= 80) return "Отлично!";
        if (score >= 60) return "Хорошо";
        if (score >= 40) return "Удовлетворительно";
        return "Неудовлетворительно";
    };

    const score = attempt.score || 0;
    const totalQuestions = attempt.test?.questions?.length || 0;
    const correctAnswers = Math.round((score / 100) * totalQuestions);

    return (
        <div className={styles.resultsContainer}>
            <div className={styles.header}>
                <h1>Результаты теста</h1>
                <h2>{attempt.test?.title}</h2>
            </div>

            <div className={styles.scoreSection}>
                <div className={`${styles.scoreCard} ${getScoreColor(score)}`}>
                    <div className={styles.scoreValue}>{score}%</div>
                    <div className={styles.scoreText}>{getScoreText(score)}</div>
                </div>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Правильных ответов:</span>
                        <span className={styles.value}>
                            {correctAnswers} из {totalQuestions}
                        </span>
                    </div>

                    {attempt.completedAt && (
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Завершено:</span>
                            <span className={styles.value}>
                                {new Date(attempt.completedAt).toLocaleString("ru-RU")}
                            </span>
                        </div>
                    )}

                    {attempt.startedAt && attempt.completedAt && (
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Время прохождения:</span>
                            <span className={styles.value}>
                                {Math.round(
                                    (new Date(attempt.completedAt).getTime() -
                                        new Date(attempt.startedAt).getTime()) /
                                        (1000 * 60),
                                )}{" "}
                                мин
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.actions}>
                <Button variant="outline" onClick={() => router.push(`/dashboard/tests/detail?id=${testId}`)}>
                    К тесту
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/tests")}>
                    К списку тестов
                </Button>
                <Button variant="primary" onClick={() => router.push("/dashboard")}>
                    На главную
                </Button>
            </div>

            {attempt.answers && attempt.answers.length > 0 && (
                <div className={styles.answersSection}>
                    <h3>Детальные результаты</h3>
                    <div className={styles.answersList}>
                        {attempt.answers.map((answer, index) => {
                            const question = attempt.test?.questions?.find(
                                (q) => q.id === answer.questionId,
                            );
                            return (
                                <div key={answer.id} className={styles.answerItem}>
                                    <div className={styles.questionNumber}>Вопрос {index + 1}</div>
                                    <div className={styles.questionText}>{question?.text}</div>
                                    <div
                                        className={`${styles.answerStatus} ${
                                            answer.isCorrect ? styles.correct : styles.incorrect
                                        }`}
                                    >
                                        {answer.isCorrect ? "✓ Правильно" : "✗ Неправильно"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestResults;
