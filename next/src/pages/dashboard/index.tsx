import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import StatusBadge from "@/shared/components/StatusBadge";
import EmptyState from "@/shared/components/EmptyState";
import TestCard from "@/shared/components/TestCard";
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
            const activeTests = tests.filter((test) => test.status === "active").length;
            const draftTests = tests.filter((test) => test.status === "draft").length;
            const completedTests = tests.filter((test) => test.status === "completed").length;

            return [
                { title: "Мои тесты", value: totalTests.toString(), icon: "📝" },
                { title: "Активных тестов", value: activeTests.toString(), icon: "🟢" },
                { title: "Черновиков", value: draftTests.toString(), icon: "📄" },
                { title: "Завершенных тестов", value: completedTests.toString(), icon: "✅" },
            ];
        } else {
            const availableTests = tests.filter((test) => test.status === "active").length;

            return [
                { title: "Доступно тестов", value: availableTests.toString(), icon: "📝" },
                { title: "Пройдено", value: "0", icon: "✅" },
                { title: "Средний балл", value: "-", icon: "📊" },
                { title: "Лучший результат", value: "-", icon: "🏆" },
            ];
        }
    };

    const stats = getStats();

    return (
        <DashboardLayout>
            <div className={styles.dashboard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {user?.role ? getDashboardTitle(user.role) : "Панель пользователя"}
                    </h1>
                    {user?.role && isTeacher(user.role) && (
                        <Button
                            variant="primary"
                            onClick={() => router.push("/dashboard/tests/create")}
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
                            {user?.role && isTeacher(user.role) ? "Мои тесты" : "Доступные тесты"}
                        </h2>
                        <Button
                            variant="outline"
                            size="small"
                            onClick={() => router.push("/dashboard/tests")}
                        >
                            Все тесты
                        </Button>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    {isLoading ? (
                        <LoadingState message="Загрузка тестов..." size="small" />
                    ) : tests.length === 0 ? (
                        <EmptyState
                            title={
                                user?.role && isTeacher(user.role)
                                    ? "У вас пока нет тестов"
                                    : "Нет доступных тестов"
                            }
                            message={
                                user?.role && isTeacher(user.role)
                                    ? "Создайте свой первый тест, чтобы начать работу"
                                    : "Пока нет активных тестов для прохождения"
                            }
                            actionText={
                                user?.role && isTeacher(user.role)
                                    ? "Создать первый тест"
                                    : undefined
                            }
                            onAction={
                                user?.role && isTeacher(user.role)
                                    ? () => router.push("/dashboard/tests/create")
                                    : undefined
                            }
                            icon="📝"
                        />
                    ) : (
                        <div className={styles.testsList}>
                            {tests.slice(0, 3).map((test) => (
                                <TestCard key={test.id} test={test} showCreator={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;
