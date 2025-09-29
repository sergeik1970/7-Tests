import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import { getAttempt } from "@/services/api";
import type { TestAttempt } from "@/services/api";
import styles from "./results.module.scss";

const TestResultsPage = () => {
    const router = useRouter();
    const { id, attemptId } = router.query;
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (attemptId && typeof attemptId === "string") {
            loadAttempt(parseInt(attemptId));
        }
    }, [attemptId]);

    const loadAttempt = async (attemptId: number) => {
        try {
            setIsLoading(true);
            const attemptData = await getAttempt(attemptId);
            setAttempt(attemptData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки результатов");
        } finally {
            setIsLoading(false);
        }
    };

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

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className={styles.loading}>
                    <p>Загрузка результатов...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !attempt) {
        return (
            <DashboardLayout>
                <div className={styles.error}>
                    <h2>Ошибка</h2>
                    <p>{error || "Результаты не найдены"}</p>
                    <Button onClick={() => router.push("/dashboard")}>Вернуться к панели</Button>
                </div>
            </DashboardLayout>
        );
    }

    const score = attempt.score || 0;
    const correctAnswers = attempt.correctAnswers || 0;
    const totalQuestions = attempt.totalQuestions;

    return (
        <DashboardLayout>
            <div className={styles.results}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Результаты теста</h1>
                    <h2 className={styles.testTitle}>{attempt.test.title}</h2>
                </div>

                <div className={styles.scoreCard}>
                    <div className={`${styles.scoreCircle} ${getScoreColor(score)}`}>
                        <div className={styles.scoreValue}>{Math.round(score)}%</div>
                        <div className={styles.scoreText}>{getScoreText(score)}</div>
                    </div>

                    <div className={styles.scoreDetails}>
                        <div className={styles.scoreItem}>
                            <span className={styles.label}>Правильных ответов:</span>
                            <span className={styles.value}>
                                {correctAnswers} из {totalQuestions}
                            </span>
                        </div>

                        <div className={styles.scoreItem}>
                            <span className={styles.label}>Время начала:</span>
                            <span className={styles.value}>
                                {new Date(attempt.startedAt).toLocaleString("ru-RU")}
                            </span>
                        </div>

                        {attempt.completedAt && (
                            <div className={styles.scoreItem}>
                                <span className={styles.label}>Время завершения:</span>
                                <span className={styles.value}>
                                    {new Date(attempt.completedAt).toLocaleString("ru-RU")}
                                </span>
                            </div>
                        )}

                        <div className={styles.scoreItem}>
                            <span className={styles.label}>Статус:</span>
                            <span
                                className={`${styles.value} ${styles.status} ${styles[attempt.status]}`}
                            >
                                {attempt.status === "completed"
                                    ? "Завершен"
                                    : attempt.status === "abandoned"
                                      ? "Прерван"
                                      : "В процессе"}
                            </span>
                        </div>
                    </div>
                </div>

                {attempt.answers && attempt.answers.length > 0 && (
                    <div className={styles.answersSection}>
                        <h3 className={styles.sectionTitle}>Детальные результаты</h3>

                        <div className={styles.answersList}>
                            {attempt.test.questions.map((question, index) => {
                                const answer = attempt.answers?.find(
                                    (a) => a.questionId === question.id,
                                );
                                const isCorrect = answer?.isCorrect || false;

                                return (
                                    <div
                                        key={question.id}
                                        className={`${styles.answerCard} ${isCorrect ? styles.correct : styles.incorrect}`}
                                    >
                                        <div className={styles.questionHeader}>
                                            <span className={styles.questionNumber}>
                                                Вопрос {index + 1}
                                            </span>
                                            <span
                                                className={`${styles.resultBadge} ${isCorrect ? styles.correct : styles.incorrect}`}
                                            >
                                                {isCorrect ? "✓ Правильно" : "✗ Неправильно"}
                                            </span>
                                        </div>

                                        <p className={styles.questionText}>{question.text}</p>

                                        {question.type === "multiple_choice" && (
                                            <div className={styles.options}>
                                                {question.options?.map((option, optionIndex) => {
                                                    const isSelected =
                                                        answer?.selectedOptionId === option.id;
                                                    const isCorrectOption = option.isCorrect;

                                                    return (
                                                        <div
                                                            key={optionIndex}
                                                            className={`${styles.option} ${
                                                                isSelected ? styles.selected : ""
                                                            } ${
                                                                isCorrectOption
                                                                    ? styles.correctOption
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className={styles.optionMarker}>
                                                                {isSelected && isCorrectOption
                                                                    ? "✓"
                                                                    : isSelected && !isCorrectOption
                                                                      ? "✗"
                                                                      : !isSelected &&
                                                                          isCorrectOption
                                                                        ? "✓"
                                                                        : "○"}
                                                            </span>
                                                            <span className={styles.optionText}>
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {question.type === "text_input" && (
                                            <div className={styles.textAnswer}>
                                                <div className={styles.answerRow}>
                                                    <strong>Ваш ответ:</strong>
                                                    <span>
                                                        {answer?.textAnswer || "Не отвечено"}
                                                    </span>
                                                </div>
                                                {question.correctTextAnswer && (
                                                    <div className={styles.answerRow}>
                                                        <strong>Правильный ответ:</strong>
                                                        <span>{question.correctTextAnswer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <Button variant="primary" onClick={() => router.push("/dashboard")}>
                        Вернуться к панели
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push(`/dashboard/tests/${attempt.testId}`)}
                    >
                        К тесту
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TestResultsPage;
