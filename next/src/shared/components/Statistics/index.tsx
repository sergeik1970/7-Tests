import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StatisticsOverview from "@/shared/components/StatisticsOverview";
import TestStatisticsTable from "@/shared/components/TestStatisticsTable";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import Button from "@/shared/components/Button";
import { getTeacherStatistics } from "@/services/api";
import type { TeacherStatistics } from "@/services/api";
import { isTeacher, type UserRole } from "@/shared/utils/roles";
import styles from "./Statistics.module.scss";

interface StatisticsProps {
    userRole?: UserRole;
    onTestClick?: (testId: number) => void;
    onError?: (error: string) => void;
    onAccessDenied?: () => void;
}

const Statistics: React.FC<StatisticsProps> = ({
    userRole,
    onTestClick,
    onError,
    onAccessDenied,
}) => {
    const router = useRouter();
    const [statistics, setStatistics] = useState<TeacherStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const isUserTeacher = userRole && isTeacher(userRole);

    useEffect(() => {
        // Проверяем права доступа
        if (userRole && !isUserTeacher) {
            onAccessDenied?.();
            return;
        }

        if (userRole) {
            loadStatistics();
        }
    }, [userRole, isUserTeacher]);

    const loadStatistics = async () => {
        try {
            setIsLoading(true);
            setError("");
            const data = await getTeacherStatistics();
            setStatistics(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки статистики";
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestClick = (testId: number) => {
        if (onTestClick) {
            onTestClick(testId);
        } else {
            router.push(`/dashboard/tests/detail?id=${testId}`);
        }
    };

    const handleRefresh = () => {
        loadStatistics();
    };

    // Проверка прав доступа
    if (userRole && !isUserTeacher) {
        return (
            <ErrorState
                title="Доступ запрещен"
                message="Статистика доступна только преподавателям"
                actionLabel="Вернуться на главную"
                onAction={() => router.push("/dashboard")}
            />
        );
    }

    if (isLoading) {
        return <LoadingState message="Загрузка статистики..." />;
    }

    if (error || !statistics) {
        return (
            <ErrorState
                title="Ошибка загрузки статистики"
                message={error || "Не удалось загрузить статистику"}
                actionLabel="Попробовать снова"
                onAction={handleRefresh}
            />
        );
    }

    return (
        <div className={styles.statisticsContainer}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Статистика</h1>
                    <p className={styles.subtitle}>Общая информация о ваших тестах и учениках</p>
                </div>
                <div className={styles.headerActions}>
                    <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
                        Обновить
                    </Button>
                </div>
            </div>

            <div className={styles.content}>
                <StatisticsOverview data={statistics.overview} />

                <TestStatisticsTable
                    data={statistics.testStatistics}
                    onTestClick={handleTestClick}
                />
            </div>
        </div>
    );
};

export default Statistics;
