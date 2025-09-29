import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import TestTimer from "@/shared/components/TestTimer";
import TestProgress from "@/shared/components/TestProgress";
import QuestionDisplay from "@/shared/components/QuestionDisplay";
import QuestionNavigation from "@/shared/components/QuestionNavigation";
import { submitAnswer, completeTest } from "@/services/api";
import type { TestAttempt, TestAnswer } from "@/services/api";
import styles from "./TestTaking.module.scss";

interface TestTakingProps {
    attempt: TestAttempt;
    onComplete?: (attemptId: number) => void;
}

const TestTaking: React.FC<TestTakingProps> = ({ attempt, onComplete }) => {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<
        Record<
            number,
            { selectedOptionId?: number; selectedOptionIds?: number[]; textAnswer?: string }
        >
    >({});
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [savingStatus, setSavingStatus] = useState<Record<number, "saved" | "saving" | "error">>(
        {},
    );
    const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
        // Инициализируем ответы из попытки
        const initialAnswers: Record<
            number,
            { selectedOptionId?: number; selectedOptionIds?: number[]; textAnswer?: string }
        > = {};

        attempt.answers?.forEach((answer: TestAnswer) => {
            const question = attempt.test?.questions?.find((q) => q.id === answer.questionId);
            if (!question || !question.id) return;

            if (question.type === "multiple_choice") {
                initialAnswers[question.id] = {
                    selectedOptionIds: answer.selectedOptionId ? [answer.selectedOptionId] : [],
                };
            } else if (question.type === "single_choice") {
                initialAnswers[question.id] = {
                    selectedOptionId: answer.selectedOptionId || undefined,
                };
            } else if (question.type === "text_input") {
                initialAnswers[question.id] = {
                    textAnswer: answer.textAnswer || "",
                };
            }
        });

        setAnswers(initialAnswers);

        // Устанавливаем оставшееся время
        if (attempt.test?.timeLimit && attempt.startedAt) {
            const startTime = new Date(attempt.startedAt).getTime();
            const currentTime = Date.now();
            const elapsed = Math.floor((currentTime - startTime) / 1000);
            const remaining = attempt.test.timeLimit * 60 - elapsed;
            setTimeLeft(Math.max(0, remaining));
        }
    }, [attempt]);

    const handleCompleteTest = useCallback(async () => {
        try {
            setIsCompleting(true);
            const completedAttempt = await completeTest(attempt.id);

            if (onComplete) {
                onComplete(attempt.id);
            } else {
                router.push(`/dashboard/tests/${attempt.testId}/results/${attempt.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка завершения теста");
            setIsCompleting(false);
        }
    }, [attempt, router, onComplete]);

    const handleAnswerChange = useCallback(
        (
            questionId: number,
            answer: {
                selectedOptionId?: number;
                selectedOptionIds?: number[];
                textAnswer?: string;
            },
        ) => {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: answer,
            }));

            // Debounced save
            if (debounceTimers.current[questionId]) {
                clearTimeout(debounceTimers.current[questionId]);
            }

            setSavingStatus((prev) => ({ ...prev, [questionId]: "saving" }));

            debounceTimers.current[questionId] = setTimeout(async () => {
                try {
                    await submitAnswer(
                        attempt.id,
                        questionId,
                        answer.selectedOptionId,
                        answer.selectedOptionIds,
                        answer.textAnswer,
                    );
                    setSavingStatus((prev) => ({ ...prev, [questionId]: "saved" }));
                } catch (err) {
                    setSavingStatus((prev) => ({ ...prev, [questionId]: "error" }));
                }
            }, 1000);
        },
        [attempt],
    );

    const handleTimeUp = useCallback(() => {
        handleCompleteTest();
    }, [handleCompleteTest]);

    // Если тест уже завершен
    if (attempt.completedAt) {
        return (
            <div className={styles.completedTest}>
                <div className={styles.completedContent}>
                    <div className={styles.completedIcon}>✅</div>
                    <h2>Тест завершен</h2>
                    <p>Вы уже завершили этот тест.</p>
                    <Button
                        variant="primary"
                        onClick={() =>
                            router.push(`/dashboard/tests/${attempt.testId}/results/${attempt.id}`)
                        }
                    >
                        Посмотреть результаты
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = attempt.test?.questions?.[currentQuestionIndex];
    const totalQuestions = attempt.test?.questions?.length || 0;

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <h3>Произошла ошибка</h3>
                    <p>{error}</p>
                    <Button variant="outline" onClick={() => setError("")}>
                        Попробовать снова
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.testTaking}>
            <div className={styles.header}>
                <div className={styles.testInfo}>
                    <h1>{attempt.test?.title}</h1>
                    <TestProgress
                        currentQuestion={currentQuestionIndex + 1}
                        totalQuestions={totalQuestions}
                    />
                </div>

                <div className={styles.controls}>
                    {timeLeft !== null && (
                        <TestTimer initialTimeLeft={timeLeft} onTimeUp={handleTimeUp} />
                    )}
                </div>
            </div>

            {currentQuestion && (
                <div className={styles.questionSection}>
                    <QuestionDisplay
                        question={currentQuestion}
                        answers={answers[currentQuestion.id!] || {}}
                        onAnswerChange={(selectedOptionId, selectedOptionIds, textAnswer) =>
                            handleAnswerChange(currentQuestion.id!, {
                                selectedOptionId,
                                selectedOptionIds,
                                textAnswer,
                            })
                        }
                        savingStatus={savingStatus[currentQuestion.id!]}
                    />

                    <QuestionNavigation
                        totalQuestions={totalQuestions}
                        currentQuestionIndex={currentQuestionIndex}
                        isQuestionAnswered={(questionIndex) => {
                            const question = attempt.test?.questions?.[questionIndex];
                            if (!question?.id) return false;
                            const answer = answers[question.id];
                            return !!(
                                answer?.selectedOptionId ||
                                answer?.selectedOptionIds?.length ||
                                answer?.textAnswer
                            );
                        }}
                        onPrevious={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                        onNext={() =>
                            setCurrentQuestionIndex((prev) =>
                                Math.min(totalQuestions - 1, prev + 1),
                            )
                        }
                        onQuestionSelect={setCurrentQuestionIndex}
                        onComplete={handleCompleteTest}
                        isCompleting={isCompleting}
                    />
                </div>
            )}
        </div>
    );
};

export default TestTaking;
