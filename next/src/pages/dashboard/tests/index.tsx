import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getTests } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./tests-list.module.scss";

const TestsListPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            setIsLoading(true);
            const testsData = await getTests();
            setTests(testsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки тестов");
        } finally {
            setIsLoading(false);
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
                    <p>Загрузка тестов...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.testsPage}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {user?.role && isTeacher(user.role) ? 'Мои тесты' : 'Доступные тесты'}
                    </h1>
                    {user?.role && isTeacher(user.role) && (
                        <Button 
                            variant="primary"
                            onClick={() => router.push('/dashboard/tests/create')}
                        >
                            Создать новый тест
                        </Button>
                    )}
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {tests.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h2>
                            {user?.role && isTeacher(user.role)
                                ? 'У вас пока нет тестов' 
                                : 'Нет доступных тестов'
                            }
                        </h2>
                        <p>
                            {user?.role && isTeacher(user.role)
                                ? 'Создайте свой первый тест, чтобы начать работу' 
                                : 'Пока нет активных тестов для прохождения'
                            }
                        </p>
                        {user?.role && isTeacher(user.role) && (
                            <Button 
                                variant="primary"
                                onClick={() => router.push('/dashboard/tests/create')}
                            >
                                Создать первый тест
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={styles.testsList}>
                        {tests.map((test) => (
                            <div key={test.id} className={styles.testCard}>
                                <div className={styles.testInfo}>
                                    <div className={styles.testHeader}>
                                        <h3 className={styles.testName}>{test.title}</h3>
                                        <span className={`${styles.status} ${getStatusClass(test.status)}`}>
                                            {getStatusText(test.status)}
                                        </span>
                                    </div>
                                    
                                    {test.description && (
                                        <p className={styles.testDescription}>
                                            {test.description}
                                        </p>
                                    )}
                                    
                                    <div className={styles.testMeta}>
                                        <span className={styles.metaItem}>
                                            📝 {test.questions.length} вопросов
                                        </span>
                                        {test.timeLimit && (
                                            <span className={styles.metaItem}>
                                                ⏱️ {test.timeLimit} мин
                                            </span>
                                        )}
                                        {test.creator && user?.role && !isTeacher(user.role) && (
                                            <span className={styles.metaItem}>
                                                👨‍🏫 {test.creator.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className={styles.testActions}>
                                    <Button 
                                        variant="outline" 
                                        size="small"
                                        onClick={() => router.push(`/dashboard/tests/${test.id}`)}
                                    >
                                        {user?.role && isTeacher(user.role) ? 'Управлять' : 
                                         test.status === 'active' ? 'Пройти' : 'Просмотр'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TestsListPage;