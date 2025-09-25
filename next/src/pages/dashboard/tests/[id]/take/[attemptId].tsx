import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import TestTimer from "@/shared/components/TestTimer";
import { getAttempt, submitAnswer, completeTest } from "@/services/api";
import type { TestAttempt, Question } from "@/services/api";
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
            const answersByQuestion: Record<number, (typeof attemptData.answers)[0][]> = {};
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

                if (firstAnswer.textAnswer) {
                    // Текстовый ответ
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

    const submitAnswerToServer = useCallback(
        async (
            questionId: number,
            selectedOptionId?: number,
            selectedOptionIds?: number[],
            textAnswer?: string,
        ) => {
            if (!attempt) return;

            setSavingStatus((prev) => ({ ...prev, [questionId]: "saving" }));
            try {
                await submitAnswer(
                    attempt.id,
                    questionId,
                    selectedOptionId,
                    selectedOptionIds,
                    textAnswer,
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

            let newAnswerData;

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
                    [questionId]: newAnswerData,
                }));

                // Для текстовых ответов используем debounce
                // Очищаем предыдущий таймер для этого вопроса
                if (debounceTimers.current[questionId]) {
                    clearTimeout(debounceTimers.current[questionId]);
                }

                // Устанавливаем новый таймер
                debounceTimers.current[questionId] = setTimeout(() => {
                    submitAnswerToServer(questionId, undefined, undefined, textAnswer);
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
    const isLastQuestion = currentQuestionIndex === (attempt?.test.questions.length || 0) - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

    // Получаем текущие ответы пользователя
    const currentAnswers = answers[currentQuestion?.id!]?.selectedOptionIds || [];

    // Подсчитываем правильные ответы для отладки
    const correctAnswers = currentQuestion?.options?.filter((opt) => opt.isCorrect) || [];
    const correctAnswersCount = correctAnswers.length;

    // Отладочная информация
    console.log("=== DEBUG INFO ===");
    console.log("Current question:", currentQuestion?.text);
    console.log("Question type:", currentQuestion?.type);
    console.log("Question ID:", currentQuestion?.id);
    console.log("Current answers:", currentAnswers);
    console.log("Current answers count:", currentAnswers.length);
    console.log("Correct answers count:", correctAnswersCount);
    console.log("Question options:", currentQuestion?.options);
    console.log("Question options length:", currentQuestion?.options?.length);
    console.log(
        "Options with correct flags:",
        currentQuestion?.options?.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
        })),
    );
    console.log("Full question object:", currentQuestion);
    console.log("==================");

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className={styles.loading}>
                    <p>Загрузка теста...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !attempt || !currentQuestion) {
        return (
            <DashboardLayout>
                <div className={styles.error}>
                    <h2>Ошибка</h2>
                    <p>{error || "Тест не найден"}</p>
                    <Button onClick={() => router.push("/dashboard")}>Вернуться к панели</Button>
                </div>
            </DashboardLayout>
        );
    }

    if (attempt.status !== "in_progress") {
        return (
            <DashboardLayout>
                <div className={styles.completed}>
                    <h2>Тест завершен</h2>
                    <p>Этот тест уже был завершен.</p>
                    <Button onClick={() => router.push("/dashboard")}>Вернуться к панели</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.takeTest}>
                <div className={styles.header}>
                    <div className={styles.testInfo}>
                        <h1 className={styles.title}>{attempt.test.title}</h1>
                        <div className={styles.progress}>
                            Вопрос {currentQuestionIndex + 1} из {attempt.test.questions.length}
                        </div>
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

                <div className={styles.questionCard}>
                    <h2 className={styles.questionText}>{currentQuestion.text}</h2>

                    {(currentQuestion.type === "single_choice" ||
                        currentQuestion.type === "multiple_choice") &&
                        currentQuestion.options &&
                        currentQuestion.options.length > 0 && (
                            <div className={styles.options}>
                                <div className={styles.choiceHint}>
                                    {currentQuestion.type === "multiple_choice"
                                        ? "Выберите один или несколько правильных вариантов ответа"
                                        : "Выберите один правильный вариант ответа"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        marginBottom: "10px",
                                        background: "#f0f0f0",
                                        padding: "5px",
                                        border: "1px solid #ccc",
                                    }}
                                >
                                    <strong>DEBUG INFO:</strong>
                                    <br />
                                    questionType = "{currentQuestion.type}" <br />
                                    questionId = {currentQuestion.id} <br />
                                    selectedAnswersCount = {currentAnswers.length} <br />
                                    correctAnswersCount = {correctAnswersCount} <br />
                                    optionsLength = {currentQuestion.options?.length || 0} <br />
                                    hasOptions = {currentQuestion.options ? "true" : "false"} <br />
                                    Correct answers:{" "}
                                    {correctAnswers.map((opt) => opt.text).join(", ") ||
                                        "none"}{" "}
                                    <br />
                                    All options:{" "}
                                    {currentQuestion.options
                                        ?.map((opt) => `${opt.text}(${opt.isCorrect ? "✓" : "✗"})`)
                                        .join(", ") || "NO OPTIONS"}{" "}
                                    <br />
                                    Input type will be:{" "}
                                    {currentQuestion.type === "multiple_choice"
                                        ? "checkbox"
                                        : "radio"}
                                </div>

                                {currentQuestion.options.map((option, index) => (
                                    <label key={index} className={styles.optionLabel}>
                                        <input
                                            type={
                                                currentQuestion.type === "multiple_choice"
                                                    ? "checkbox"
                                                    : "radio"
                                            }
                                            name={
                                                currentQuestion.type === "multiple_choice"
                                                    ? undefined
                                                    : `question-${currentQuestion.id}`
                                            }
                                            value={option.id}
                                            checked={(
                                                answers[currentQuestion.id!]?.selectedOptionIds ||
                                                []
                                            ).includes(option.id)}
                                            onChange={() =>
                                                handleAnswerChange(
                                                    currentQuestion.id!,
                                                    option.id,
                                                    undefined,
                                                    undefined,
                                                    currentQuestion.type,
                                                )
                                            }
                                        />
                                        <span className={styles.optionText}>{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                    {/* Отладочная информация для случаев, когда варианты не показываются */}
                    {(currentQuestion.type === "single_choice" ||
                        currentQuestion.type === "multiple_choice") &&
                        (!currentQuestion.options || currentQuestion.options.length === 0) && (
                            <div
                                style={{
                                    background: "#ffebee",
                                    border: "1px solid #f44336",
                                    padding: "10px",
                                    color: "#d32f2f",
                                    marginBottom: "10px",
                                }}
                            >
                                <strong>⚠️ ПРОБЛЕМА: Варианты ответов не найдены!</strong>
                                <br />
                                questionType = "{currentQuestion.type}" <br />
                                hasOptions = {currentQuestion.options ? "true" : "false"} <br />
                                optionsLength = {currentQuestion.options?.length || 0} <br />
                                options = {JSON.stringify(currentQuestion.options)}
                            </div>
                        )}

                    {currentQuestion.type === "text_input" && (
                        <div className={styles.textInput}>
                            <textarea
                                value={answers[currentQuestion.id!]?.textAnswer || ""}
                                onChange={(e) =>
                                    handleAnswerChange(
                                        currentQuestion.id!,
                                        undefined,
                                        undefined,
                                        e.target.value,
                                    )
                                }
                                placeholder="Введите ваш ответ..."
                                rows={4}
                            />
                        </div>
                    )}

                    {/* Индикатор сохранения для текущего вопроса */}
                    {savingStatus[currentQuestion.id!] && (
                        <div
                            className={`${styles.questionSavingIndicator} ${styles[savingStatus[currentQuestion.id!]]}`}
                        >
                            {savingStatus[currentQuestion.id!] === "saving" && "💾 Сохранение..."}
                            {savingStatus[currentQuestion.id!] === "saved" && "✅ Сохранено"}
                            {savingStatus[currentQuestion.id!] === "error" &&
                                "❌ Ошибка сохранения"}
                        </div>
                    )}
                </div>

                <div className={styles.navigation}>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                        disabled={isFirstQuestion}
                    >
                        Предыдущий
                    </Button>

                    <div className={styles.questionIndicators}>
                        {attempt.test.questions.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.indicator} ${
                                    index === currentQuestionIndex ? styles.current : ""
                                } ${
                                    answers[attempt.test.questions[index].id!]
                                        ? styles.answered
                                        : ""
                                }`}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>

                    {!isLastQuestion ? (
                        <Button
                            variant="primary"
                            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        >
                            Следующий
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleCompleteTest}
                            disabled={isCompleting}
                        >
                            {isCompleting ? "Завершение..." : "Завершить тест"}
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TakeTestPage;
