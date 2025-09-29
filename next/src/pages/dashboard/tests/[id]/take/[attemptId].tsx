import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import TestTimer from "@/shared/components/TestTimer";
import TestProgress from "@/shared/components/TestProgress";
import QuestionDisplay from "@/shared/components/QuestionDisplay";
import QuestionNavigation from "@/shared/components/QuestionNavigation";
import { getAttempt, submitAnswer, completeTest } from "@/services/api";
import type { TestAttempt, Question, TestAnswer } from "@/services/api";
import styles from "./take-test.module.scss";

const TakeTestPage = () => {
    const router = useRouter();
    const { id, attemptId } = router.query;
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<
        Record<
            number,
            { selectedOptionId?: number; selectedOptionIds?: number[]; textAnswer?: string }
        >
    >({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [savingStatus, setSavingStatus] = useState<Record<number, "saved" | "saving" | "error">>(
        {},
    );
    const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
        if (attemptId && typeof attemptId === "string") {
            loadAttempt(parseInt(attemptId));
        }
    }, [attemptId]);

    const handleCompleteTest = useCallback(async () => {
        if (!attempt) return;

        try {
            setIsCompleting(true);
            const completedAttempt = await completeTest(attempt.id);
            router.push(`/dashboard/tests/${attempt.testId}/results/${attempt.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка завершения теста");
            setIsCompleting(false);
        }
    }, [attempt, router]);

    const loadAttempt = async (attemptId: number) => {
        try {
            setIsLoading(true);
            const attemptData = await getAttempt(attemptId);
            console.log("=== LOADED ATTEMPT DATA ===");
            console.log("Full attempt data:", attemptData);
            console.log("Test questions:", attemptData.test?.questions);
            attemptData.test?.questions?.forEach((q, index) => {
                console.log(`Question ${index + 1}:`, {
                    id: q.id,
                    text: q.text,
                    type: q.type,
                    optionsCount: q.options?.length,
                    options: q.options?.map((opt) => ({
                        id: opt.id,
                        text: opt.text,
                        isCorrect: opt.isCorrect,
                    })),
                });
            });
            console.log("===========================");
            setAttempt(attemptData);

            // Загружаем существующие ответы
            const existingAnswers: Record<
                number,
                { selectedOptionId?: number; selectedOptionIds?: number[]; textAnswer?: string }
            > = {};

            // Группируем ответы по вопросам
            const answersByQuestion: Record<number, TestAnswer[]> = {};
            attemptData.answers?.forEach((answer) => {
                if (!answersByQuestion[answer.questionId]) {
                    answersByQuestion[answer.questionId] = [];
                }
                answersByQuestion[answer.questionId].push(answer);
            });

            // Обрабатываем каждый вопрос
            Object.entries(answersByQuestion).forEach(([questionIdStr, questionAnswers]) => {
                const questionId = parseInt(questionIdStr);
                const firstAnswer = questionAnswers[0];

                if (firstAnswer.textAnswer !== undefined && firstAnswer.textAnswer !== null) {
                    // Текстовый ответ (включая пустые строки)
                    existingAnswers[questionId] = {
                        textAnswer: firstAnswer.textAnswer,
                    };
                } else {
                    // Ответы с выбором вариантов
                    const selectedIds = questionAnswers
                        .filter((answer) => answer.selectedOptionId)
                        .map((answer) => answer.selectedOptionId!);

                    if (selectedIds.length === 1) {
                        // Один выбранный вариант - переводим в selectedOptionIds для единообразия
                        existingAnswers[questionId] = {
                            selectedOptionIds: selectedIds,
                        };
                    } else if (selectedIds.length > 1) {
                        // Несколько выбранных вариантов
                        existingAnswers[questionId] = {
                            selectedOptionIds: selectedIds,
                        };
                    }
                }
            });

            setAnswers(existingAnswers);

            if (attemptData.remainingTime !== undefined) {
                // remainingTime уже приходит в минутах как оставшееся время
                const initialTimeLeft = Math.floor(attemptData.remainingTime * 60);
                console.log("Initial time setup:", {
                    remainingTimeMinutes: attemptData.remainingTime,
                    initialTimeLeftSeconds: initialTimeLeft,
                    startedAt: attemptData.startedAt,
                });
                setTimeLeft(initialTimeLeft);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки теста");
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для проверки, действительно ли вопрос отвечен
    const isQuestionAnswered = (questionId: number): boolean => {
        const answer = answers[questionId];
        if (!answer) return false;

        // Для текстовых вопросов проверяем наличие непустого текста
        if (answer.textAnswer !== undefined) {
            return typeof answer.textAnswer === "string" && answer.textAnswer.trim().length > 0;
        }

        // Для вопросов с выбором проверяем наличие выбранных вариантов
        if (answer.selectedOptionIds && answer.selectedOptionIds.length > 0) {
            return true;
        }

        if (answer.selectedOptionId !== undefined) {
            return true;
        }

        return false;
    };

    const submitAnswerToServer = useCallback(
        async (
            questionId: number,
            selectedOptionId?: number,
            selectedOptionIds?: number[],
            textAnswer?: string | null,
        ) => {
            if (!attempt) return;

            setSavingStatus((prev) => ({ ...prev, [questionId]: "saving" }));
            try {
                await submitAnswer(
                    attempt.id,
                    questionId,
                    selectedOptionId,
                    selectedOptionIds,
                    textAnswer || undefined,
                );
                setSavingStatus((prev) => ({ ...prev, [questionId]: "saved" }));

                // Убираем индикатор "сохранено" через 2 секунды
                setTimeout(() => {
                    setSavingStatus((prev) => {
                        const newStatus = { ...prev };
                        delete newStatus[questionId];
                        return newStatus;
                    });
                }, 2000);
            } catch (err) {
                setSavingStatus((prev) => ({ ...prev, [questionId]: "error" }));
                setError(err instanceof Error ? err.message : "Ошибка отправки ответа");
            }
        },
        [attempt],
    );

    const handleAnswerChange = useCallback(
        (
            questionId: number,
            selectedOptionId?: number,
            selectedOptionIds?: number[],
            textAnswer?: string,
            questionType?: string,
        ) => {
            if (!attempt) return;

            console.log("handleAnswerChange called:", {
                questionId,
                selectedOptionId,
                questionType,
            });
            console.log("Current answers state:", answers[questionId]);

            let newAnswerData: { selectedOptionIds?: number[]; textAnswer?: string } | undefined;

            if (selectedOptionId !== undefined) {
                // Для чекбоксов (и одиночный, и множественный выбор)
                setAnswers((prev) => {
                    const currentSelectedIds = prev[questionId]?.selectedOptionIds || [];

                    let newSelectedIds;
                    if (questionType === "multiple_choice") {
                        // Множественный выбор - переключаем состояние опции (чекбоксы)
                        newSelectedIds = currentSelectedIds.includes(selectedOptionId)
                            ? currentSelectedIds.filter((id) => id !== selectedOptionId) // Убираем если уже выбран
                            : [...currentSelectedIds, selectedOptionId]; // Добавляем если не выбран
                    } else {
                        // Одиночный выбор - всегда заменяем на новый выбор (радио-кнопки)
                        newSelectedIds = [selectedOptionId];
                    }

                    const newAnswerData = { selectedOptionIds: newSelectedIds };

                    // Отправляем на сервер
                    submitAnswerToServer(questionId, undefined, newSelectedIds, undefined);

                    return {
                        ...prev,
                        [questionId]: newAnswerData,
                    };
                });
            } else if (textAnswer !== undefined) {
                // Для текстовых ответов
                newAnswerData = { textAnswer };

                // Обновляем локальное состояние
                setAnswers((prev) => ({
                    ...prev,
                    [questionId]: newAnswerData!,
                }));

                // Для текстовых ответов используем debounce
                // Очищаем предыдущий таймер для этого вопроса
                if (debounceTimers.current[questionId]) {
                    clearTimeout(debounceTimers.current[questionId]);
                }

                // Устанавливаем новый таймер
                debounceTimers.current[questionId] = setTimeout(() => {
                    // Если текст пустой, отправляем null вместо пустой строки
                    const textToSend = textAnswer.trim() === "" ? null : textAnswer;
                    submitAnswerToServer(questionId, undefined, undefined, textToSend);
                }, 1000); // Отправляем через 1 секунду после последнего изменения
            }
        },
        [attempt, answers, submitAnswerToServer],
    );

    // Очищаем таймеры при размонтировании компонента
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    const currentQuestion = attempt?.test.questions[currentQuestionIndex];

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка теста..." />
            </DashboardLayout>
        );
    }

    if (error || !attempt || !currentQuestion) {
        return (
            <DashboardLayout>
                <ErrorState
                    title="Ошибка"
                    message={error || "Тест не найден"}
                    actionText="Вернуться к панели"
                    onAction={() => router.push("/dashboard")}
                />
            </DashboardLayout>
        );
    }

    if (attempt.status !== "in_progress") {
        return (
            <DashboardLayout>
                <ErrorState
                    title="Тест завершен"
                    message="Этот тест уже был завершен."
                    actionText="Вернуться к панели"
                    onAction={() => router.push("/dashboard")}
                    variant="info"
                    showIcon={false}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.takeTest}>
                <div className={styles.header}>
                    <div className={styles.testInfo}>
                        <h1 className={styles.title}>{attempt.test.title}</h1>
                        <TestProgress
                            currentQuestion={currentQuestionIndex + 1}
                            totalQuestions={attempt.test.questions.length}
                            className={styles.progressComponent}
                        />
                    </div>

                    {timeLeft !== null && attempt.test.timeLimit && (
                        <TestTimer
                            initialTimeLeft={timeLeft}
                            onTimeUp={handleCompleteTest}
                            className={styles.timer}
                        />
                    )}
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <QuestionDisplay
                    question={currentQuestion}
                    answers={answers[currentQuestion.id!] || {}}
                    onAnswerChange={(selectedOptionId, selectedOptionIds, textAnswer) =>
                        handleAnswerChange(
                            currentQuestion.id!,
                            selectedOptionId,
                            selectedOptionIds,
                            textAnswer,
                            currentQuestion.type,
                        )
                    }
                    savingStatus={savingStatus[currentQuestion.id!]}
                    showDebugInfo={true}
                />

                <QuestionNavigation
                    totalQuestions={attempt.test.questions.length}
                    currentQuestionIndex={currentQuestionIndex}
                    isQuestionAnswered={(index) =>
                        isQuestionAnswered(attempt.test.questions[index].id!)
                    }
                    onPrevious={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    onNext={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    onQuestionSelect={setCurrentQuestionIndex}
                    onComplete={handleCompleteTest}
                    isCompleting={isCompleting}
                />
            </div>
        </DashboardLayout>
    );
};

export default TakeTestPage;
