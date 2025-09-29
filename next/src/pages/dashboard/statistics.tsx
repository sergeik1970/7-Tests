import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import StatisticsOverview from "@/shared/components/StatisticsOverview";
import TestStatisticsTable from "@/shared/components/TestStatisticsTable";
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
            router.push("/dashboard");
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

    const handleTestClick = (testId: number) => {
        router.push(`/dashboard/tests/${testId}`);
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

                <StatisticsOverview data={statistics.overview} />

                <TestStatisticsTable
                    data={statistics.testStatistics}
                    onTestClick={handleTestClick}
                />
            </div>
        </DashboardLayout>
    );
};

export default StatisticsPage;
