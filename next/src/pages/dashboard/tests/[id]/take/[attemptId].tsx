import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import { getAttempt, submitAnswer, completeTest } from "@/services/api";
import type { TestAttempt, Question } from "@/services/api";
import styles from "./take-test.module.scss";

const TakeTestPage = () => {
    const router = useRouter();
    const { id, attemptId } = router.query;
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, { selectedOptionId?: number; textAnswer?: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [error, setError] = useState("");
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [savingStatus, setSavingStatus] = useState<Record<number, 'saved' | 'saving' | 'error'>>({});
    const debounceTimers = useRef<Record<number, NodeJS.Timeout>>({});

    useEffect(() => {
        if (attemptId && typeof attemptId === 'string') {
            loadAttempt(parseInt(attemptId));
        }
    }, [attemptId]);

    // Таймер для отслеживания времени
    useEffect(() => {
        if (!attempt || !attempt.test.timeLimit || attempt.status !== 'in_progress') return;

        const timer = setInterval(() => {
            if (attempt.remainingTime !== undefined) {
                const now = Date.now();
                const startTime = new Date(attempt.startedAt).getTime();
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                const totalTimeInSeconds = attempt.remainingTime * 60;
                const newTimeLeft = totalTimeInSeconds - elapsedSeconds;
                
                // Отладочная информация
                console.log('Timer debug:', {
                    remainingTime: attempt.remainingTime,
                    totalTimeInSeconds,
                    elapsedSeconds,
                    newTimeLeft,
                    startedAt: attempt.startedAt
                });
                
                setTimeLeft(Math.max(0, newTimeLeft));
                
                if (newTimeLeft <= 0) {
                    handleCompleteTest();
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [attempt]);

    const loadAttempt = async (attemptId: number) => {
        try {
            setIsLoading(true);
            const attemptData = await getAttempt(attemptId);
            setAttempt(attemptData);
            
            // Загружаем существующие ответы
            const existingAnswers: Record<number, { selectedOptionId?: number; textAnswer?: string }> = {};
            attemptData.answers?.forEach(answer => {
                existingAnswers[answer.questionId] = {
                    selectedOptionId: answer.selectedOptionId,
                    textAnswer: answer.textAnswer,
                };
            });
            setAnswers(existingAnswers);
            
            if (attemptData.remainingTime !== undefined) {
                const initialTimeLeft = attemptData.remainingTime * 60;
                console.log('Initial time setup:', {
                    remainingTime: attemptData.remainingTime,
                    initialTimeLeft,
                    startedAt: attemptData.startedAt
                });
                setTimeLeft(initialTimeLeft);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки теста");
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswerToServer = useCallback(async (questionId: number, selectedOptionId?: number, textAnswer?: string) => {
        if (!attempt) return;

        setSavingStatus(prev => ({ ...prev, [questionId]: 'saving' }));
        try {
            await submitAnswer(attempt.id, questionId, selectedOptionId, textAnswer);
            setSavingStatus(prev => ({ ...prev, [questionId]: 'saved' }));
            
            // Убираем индикатор "сохранено" через 2 секунды
            setTimeout(() => {
                setSavingStatus(prev => {
                    const newStatus = { ...prev };
                    delete newStatus[questionId];
                    return newStatus;
                });
            }, 2000);
        } catch (err) {
            setSavingStatus(prev => ({ ...prev, [questionId]: 'error' }));
            setError(err instanceof Error ? err.message : "Ошибка отправки ответа");
        }
    }, [attempt]);

    const handleAnswerChange = useCallback((questionId: number, selectedOptionId?: number, textAnswer?: string) => {
        if (!attempt) return;

        // Обновляем локальное состояние немедленно
        const newAnswers = {
            ...answers,
            [questionId]: { selectedOptionId, textAnswer }
        };
        setAnswers(newAnswers);

        // Для множественного выбора отправляем сразу
        if (selectedOptionId !== undefined) {
            submitAnswerToServer(questionId, selectedOptionId, textAnswer);
        } 
        // Для текстовых ответов используем debounce
        else if (textAnswer !== undefined) {
            // Очищаем предыдущий таймер для этого вопроса
            if (debounceTimers.current[questionId]) {
                clearTimeout(debounceTimers.current[questionId]);
            }
            
            // Устанавливаем новый таймер
            debounceTimers.current[questionId] = setTimeout(() => {
                submitAnswerToServer(questionId, selectedOptionId, textAnswer);
            }, 1000); // Отправляем через 1 секунду после последнего изменения
        }
    }, [attempt, answers, submitAnswerToServer]);

    // Очищаем таймеры при размонтировании компонента
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
        };
    }, []);

    const handleCompleteTest = async () => {
        if (!attempt) return;

        try {
            setIsCompleting(true);
            const completedAttempt = await completeTest(attempt.id);
            router.push(`/dashboard/tests/${attempt.testId}/results/${attempt.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка завершения теста");
            setIsCompleting(false);
        }
    };

    const formatTime = (seconds: number) => {
        // Проверяем, что значение корректное
        if (!seconds || seconds < 0 || !isFinite(seconds)) {
            return "0:00";
        }
        
        // Округляем до целого числа секунд
        const totalSeconds = Math.floor(seconds);
        
        // Если время больше 24 часов, что-то пошло не так
        if (totalSeconds > 86400) {
            console.warn('Некорректное время:', seconds);
            return "0:00";
        }
        
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        
        // Если больше часа, показываем часы
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Иначе показываем только минуты и секунды
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const currentQuestion = attempt?.test.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === (attempt?.test.questions.length || 0) - 1;
    const isFirstQuestion = currentQuestionIndex === 0;

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
                    <Button onClick={() => router.push('/dashboard')}>
                        Вернуться к панели
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    if (attempt.status !== 'in_progress') {
        return (
            <DashboardLayout>
                <div className={styles.completed}>
                    <h2>Тест завершен</h2>
                    <p>Этот тест уже был завершен.</p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Вернуться к панели
                    </Button>
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
                    
                    {timeLeft !== null && (
                        <div className={`${styles.timer} ${timeLeft < 300 ? styles.warning : ''}`}>
                            <span>Осталось времени: {formatTime(timeLeft)}</span>
                        </div>
                    )}
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.questionCard}>
                    <h2 className={styles.questionText}>{currentQuestion.text}</h2>
                    
                    {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                        <div className={styles.options}>
                            {currentQuestion.options.map((option, index) => (
                                <label key={index} className={styles.optionLabel}>
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion.id}`}
                                        value={option.id}
                                        checked={answers[currentQuestion.id!]?.selectedOptionId === option.id}
                                        onChange={() => handleAnswerChange(currentQuestion.id!, option.id)}
                                    />
                                    <span className={styles.optionText}>{option.text}</span>
                                </label>
                            ))}
                        </div>
                    )}
                    
                    {currentQuestion.type === 'text_input' && (
                        <div className={styles.textInput}>
                            <textarea
                                value={answers[currentQuestion.id!]?.textAnswer || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id!, undefined, e.target.value)}
                                placeholder="Введите ваш ответ..."
                                rows={4}
                            />
                        </div>
                    )}
                    
                    {/* Индикатор сохранения для текущего вопроса */}
                    {savingStatus[currentQuestion.id!] && (
                        <div className={`${styles.questionSavingIndicator} ${styles[savingStatus[currentQuestion.id!]]}`}>
                            {savingStatus[currentQuestion.id!] === 'saving' && '💾 Сохранение...'}
                            {savingStatus[currentQuestion.id!] === 'saved' && '✅ Сохранено'}
                            {savingStatus[currentQuestion.id!] === 'error' && '❌ Ошибка сохранения'}
                        </div>
                    )}
                </div>

                <div className={styles.navigation}>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={isFirstQuestion}
                    >
                        Предыдущий
                    </Button>
                    
                    <div className={styles.questionIndicators}>
                        {attempt.test.questions.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.indicator} ${
                                    index === currentQuestionIndex ? styles.current : ''
                                } ${
                                    answers[attempt.test.questions[index].id!] ? styles.answered : ''
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
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
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