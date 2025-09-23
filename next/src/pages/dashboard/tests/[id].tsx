import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getTest, publishTest, deactivateTest, deleteTest, startTest } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./test-detail.module.scss";

const TestDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id && typeof id === 'string') {
            loadTest(parseInt(id));
        }
    }, [id]);

    const loadTest = async (testId: number) => {
        try {
            setIsLoading(true);
            const testData = await getTest(testId);
            setTest(testData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки теста");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePublish = async () => {
        if (!test) return;
        
        try {
            setIsPublishing(true);
            const updatedTest = await publishTest(test.id!);
            setTest(updatedTest);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка публикации теста");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeactivate = async () => {
        if (!test) return;

        if (!confirm("Вы уверены, что хотите деактивировать тест? Ученики больше не смогут его проходить.")) {
            return;
        }

        try {
            setIsDeactivating(true);
            const updatedTest = await deactivateTest(test.id!);
            setTest(updatedTest);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка деактивации теста");
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDelete = async () => {
        if (!test || !confirm("Вы уверены, что хотите удалить этот тест?")) return;
        
        try {
            setIsDeleting(true);
            await deleteTest(test.id!);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка удаления теста");
            setIsDeleting(false);
        }
    };

    const handleStartTest = async () => {
        if (!test) return;
        
        try {
            setIsStarting(true);
            const attempt = await startTest(test.id!);
            router.push(`/dashboard/tests/${test.id}/take/${attempt.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка начала теста");
            setIsStarting(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'active': return 'Активный';
            case 'completed': return 'Завершен';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'draft': return styles.statusDraft;
            case 'active': return styles.statusActive;
            case 'completed': return styles.statusCompleted;
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className={styles.loading}>
                    <p>Загрузка теста...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !test) {
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

    const isOwner = user?.role && isTeacher(user.role) && test.creator?.id === user.id;

    return (
        <DashboardLayout>
            <div className={styles.testDetail}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>{test.title}</h1>
                        <span className={`${styles.status} ${getStatusClass(test.status)}`}>
                            {getStatusText(test.status)}
                        </span>
                    </div>
                    
                    <div className={styles.actions}>
                        {isOwner && (
                            <>
                                {test.status === 'draft' && (
                                    <Button 
                                        variant="primary"
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                    >
                                        {isPublishing ? "Публикация..." : "Опубликовать"}
                                    </Button>
                                )}
                                
                                {test.status === 'active' && (
                                    <Button 
                                        variant="outline"
                                        onClick={handleDeactivate}
                                        disabled={isDeactivating}
                                        className={styles.deactivateButton}
                                    >
                                        {isDeactivating ? "Деактивация..." : "Деактивировать"}
                                    </Button>
                                )}
                                
                                <Button 
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/tests/${test.id}/edit`)}
                                    disabled={isPublishing || isDeleting}
                                >
                                    Редактировать
                                </Button>
                                
                                <Button 
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={isPublishing || isDeleting}
                                    className={styles.deleteButton}
                                >
                                    {isDeleting ? "Удаление..." : "Удалить"}
                                </Button>
                            </>
                        )}
                        

                        
                        <Button 
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Назад
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.content}>
                    <div className={styles.info}>
                        <div className={styles.infoItem}>
                            <strong>Описание:</strong>
                            <p>{test.description || "Описание не указано"}</p>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <strong>Время на прохождение:</strong>
                            <p>{test.timeLimit ? `${test.timeLimit} минут` : "Не ограничено"}</p>
                        </div>
                        
                        <div className={styles.infoItem}>
                            <strong>Количество вопросов:</strong>
                            <p>{test.questions.length}</p>
                        </div>
                        
                        {test.creator && (
                            <div className={styles.infoItem}>
                                <strong>Автор:</strong>
                                <p>{test.creator.name}</p>
                            </div>
                        )}
                    </div>

                    {isOwner && (
                        <div className={styles.questions}>
                            <h2 className={styles.sectionTitle}>Вопросы</h2>
                            
                            {test.questions.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>В тесте пока нет вопросов</p>
                                </div>
                            ) : (
                                <div className={styles.questionsList}>
                                    {test.questions.map((question, index) => (
                                        <div key={question.id || index} className={styles.questionCard}>
                                            <div className={styles.questionHeader}>
                                                <h3 className={styles.questionTitle}>
                                                    Вопрос {index + 1}
                                                </h3>
                                                <span className={styles.questionType}>
                                                    {question.type === 'multiple_choice' ? 'Выбор из вариантов' : 'Текстовый ответ'}
                                                </span>
                                            </div>
                                            
                                            <p className={styles.questionText}>{question.text}</p>
                                            
                                            {question.type === 'multiple_choice' && question.options && (
                                                <div className={styles.options}>
                                                    {question.options.map((option, optionIndex) => (
                                                        <div 
                                                            key={optionIndex} 
                                                            className={`${styles.option} ${option.isCorrect ? styles.correctOption : ''}`}
                                                        >
                                                            <span className={styles.optionMarker}>
                                                                {option.isCorrect ? '✓' : '○'}
                                                            </span>
                                                            <span className={styles.optionText}>
                                                                {option.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {question.type === 'text_input' && question.correctTextAnswer && (
                                                <div className={styles.textAnswer}>
                                                    <strong>Правильный ответ:</strong> {question.correctTextAnswer}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {!isOwner && test.status === 'active' && (
                        <div className={styles.studentInfo}>
                            <div className={styles.infoCard}>
                                <h3>Готовы начать тест?</h3>
                                <p>После начала теста у вас будет {test.timeLimit ? `${test.timeLimit} минут` : 'неограниченное время'} на прохождение.</p>
                                <p>Тест содержит {test.questions.length} {test.questions.length === 1 ? 'вопрос' : test.questions.length < 5 ? 'вопроса' : 'вопросов'}.</p>
                                
                                <div className={styles.startTestSection}>
                                    <Button
                                        variant="primary"
                                        onClick={handleStartTest}
                                        disabled={isStarting || test.questions.length === 0}
                                        className={styles.startButton}
                                    >
                                        {isStarting ? "Начинаем..." : "Начать тест"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TestDetailPage;