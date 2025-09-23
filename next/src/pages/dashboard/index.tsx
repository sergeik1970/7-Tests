import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getTests } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher, getDashboardTitle } from "@/shared/utils/roles";
import styles from "./dashboard.module.scss";

const DashboardPage = () => {
    const { user } = useAuth();
    const router = useRouter();
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

    // Вычисляем статистику на основе реальных данных
    const getStats = () => {
        if (user?.role && isTeacher(user.role)) {
            const totalTests = tests.length;
            const activeTests = tests.filter(test => test.status === 'active').length;
            const draftTests = tests.filter(test => test.status === 'draft').length;
            const completedTests = tests.filter(test => test.status === 'completed').length;

            return [
                { title: "Мои тесты", value: totalTests.toString(), icon: "📝" },
                { title: "Активных тестов", value: activeTests.toString(), icon: "🟢" },
                { title: "Черновиков", value: draftTests.toString(), icon: "📄" },
                { title: "Завершенных тестов", value: completedTests.toString(), icon: "✅" }
            ];
        } else {
            const availableTests = tests.filter(test => test.status === 'active').length;
            
            return [
                { title: "Доступно тестов", value: availableTests.toString(), icon: "📝" },
                { title: "Пройдено", value: "0", icon: "✅" },
                { title: "Средний балл", value: "-", icon: "📊" },
                { title: "Лучший результат", value: "-", icon: "🏆" }
            ];
        }
    };

    const stats = getStats();

    return (
        <DashboardLayout>
            <div className={styles.dashboard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {user?.role ? getDashboardTitle(user.role) : 'Панель пользователя'}
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

                <div className={styles.stats}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statIcon}>{stat.icon}</div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>{stat.value}</div>
                                <div className={styles.statTitle}>{stat.title}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {user?.role && isTeacher(user.role) ? 'Мои тесты' : 'Доступные тесты'}
                        </h2>
                        <Button 
                            variant="outline" 
                            size="small"
                            onClick={() => router.push('/dashboard/tests')}
                        >
                            Все тесты
                        </Button>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className={styles.loading}>
                            <p>Загрузка тестов...</p>
                        </div>
                    ) : tests.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>
                                {user?.role && isTeacher(user.role)
                                    ? 'У вас пока нет тестов' 
                                    : 'Нет доступных тестов'
                                }
                            </p>
                            {user?.role && isTeacher(user.role) && (
                                <Button 
                                    variant="primary"
                                    size="small"
                                    onClick={() => router.push('/dashboard/tests/create')}
                                >
                                    Создать первый тест
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className={styles.testsList}>
                            {tests.slice(0, 3).map((test) => (
                                <div key={test.id} className={styles.testCard}>
                                    <div className={styles.testInfo}>
                                        <h3 className={styles.testName}>{test.title}</h3>
                                        {test.description && (
                                            <p className={styles.testDescription}>{test.description}</p>
                                        )}
                                        <div className={styles.testMeta}>
                                            <span>📝 {test.questions.length} вопросов</span>
                                            {test.timeLimit && (
                                                <span>⏱️ {test.timeLimit} мин</span>
                                            )}
                                            {test.creator && user?.role && !isTeacher(user.role) && (
                                                <span>👨‍🏫 {test.creator.name}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.testActions}>
                                        <span className={`${styles.status} ${styles[test.status]}`}>
                                            {test.status === 'active' && 'Активный'}
                                            {test.status === 'completed' && 'Завершен'}
                                            {test.status === 'draft' && 'Черновик'}
                                        </span>
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
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;