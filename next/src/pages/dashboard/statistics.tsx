import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getTeacherStatistics } from "@/services/api";
import type { TeacherStatistics } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./statistics.module.scss";

const StatisticsPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Проверяем, что пользователь - учитель или преподаватель
        if (user && !isTeacher(user.role)) {
            router.push('/dashboard');
            return;
        }

        if (user) {
            loadStatistics();
        }
    }, [user, router]);

    const loadStatistics = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await getTeacherStatistics();
            setStatistics(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки статистики");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Активный';
            case 'draft': return 'Черновик';
            default: return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return styles.statusActive;
            case 'draft': return styles.statusDraft;
            default: return '';
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className={styles.loading}>
                    <h2>Загрузка статистики...</h2>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !statistics) {
        return (
            <DashboardLayout>
                <div className={styles.error}>
                    <h2>Ошибка</h2>
                    <p>{error || "Не удалось загрузить статистику"}</p>
                    <button onClick={loadStatistics} className={styles.retryButton}>
                        Попробовать снова
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className={styles.statisticsPage}>
                <div className={styles.header}>
                    <h1>Статистика</h1>
                    <p>Общая информация о ваших тестах и учениках</p>
                </div>

                {/* Общая статистика */}
                <div className={styles.overviewSection}>
                    <h2>Общая статистика</h2>
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>📝</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{statistics.overview.totalTests}</div>
                                <div className={styles.statLabel}>Всего тестов</div>
                                <div className={styles.statDetails}>
                                    {statistics.overview.activeTests} активных, {statistics.overview.draftTests} черновиков
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>👥</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{statistics.overview.totalStudents}</div>
                                <div className={styles.statLabel}>Учеников</div>
                                <div className={styles.statDetails}>
                                    Прошли ваши тесты
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>🎯</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{statistics.overview.totalAttempts}</div>
                                <div className={styles.statLabel}>Попыток</div>
                                <div className={styles.statDetails}>
                                    {statistics.overview.completedAttempts} завершено
                                </div>
                            </div>
                        </div>

                        <div className={styles.statCard}>
                            <div className={styles.statIcon}>⭐</div>
                            <div className={styles.statContent}>
                                <div className={styles.statNumber}>{statistics.overview.averageScore}%</div>
                                <div className={styles.statLabel}>Средний балл</div>
                                <div className={styles.statDetails}>
                                    По всем тестам
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Статистика по тестам */}
                <div className={styles.testsSection}>
                    <h2>Статистика по тестам</h2>
                    {statistics.testStatistics.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>У вас пока нет тестов</p>
                        </div>
                    ) : (
                        <div className={styles.testsTable}>
                            <div className={styles.tableHeader}>
                                <div className={styles.tableCell}>Название теста</div>
                                <div className={styles.tableCell}>Статус</div>
                                <div className={styles.tableCell}>Попыток</div>
                                <div className={styles.tableCell}>Завершено</div>
                                <div className={styles.tableCell}>Средний балл</div>
                                <div className={styles.tableCell}>Создан</div>
                            </div>
                            {statistics.testStatistics.map((test) => (
                                <div key={test.id} className={styles.tableRow}>
                                    <div className={styles.tableCell}>
                                        <div className={styles.testTitle}>{test.title}</div>
                                    </div>
                                    <div className={styles.tableCell}>
                                        <span className={`${styles.status} ${getStatusClass(test.status)}`}>
                                            {getStatusText(test.status)}
                                        </span>
                                    </div>
                                    <div className={styles.tableCell}>{test.totalAttempts}</div>
                                    <div className={styles.tableCell}>{test.completedAttempts}</div>
                                    <div className={styles.tableCell}>
                                        {test.averageScore > 0 ? `${test.averageScore}%` : '—'}
                                    </div>
                                    <div className={styles.tableCell}>
                                        {new Date(test.createdAt).toLocaleDateString('ru-RU')}
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

export default StatisticsPage;