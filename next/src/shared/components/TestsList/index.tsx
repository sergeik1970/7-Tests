import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import LoadingState from "@/shared/components/LoadingState";
import EmptyState from "@/shared/components/EmptyState";
import TestCard from "@/shared/components/TestCard";
import { getTests } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher, type UserRole } from "@/shared/utils/roles";
import styles from "./TestsList.module.scss";

interface TestsListProps {
    userRole?: UserRole;
    onCreateTest?: () => void;
    onError?: (error: string) => void;
}

const TestsList: React.FC<TestsListProps> = ({ userRole, onCreateTest, onError }) => {
    const router = useRouter();
    const [tests, setTests] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const isUserTeacher = userRole && isTeacher(userRole);

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            setIsLoading(true);
            setError("");
            const testsData = await getTests();
            setTests(testsData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки тестов";
            setError(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTest = () => {
        if (onCreateTest) {
            onCreateTest();
        } else {
            router.push("/dashboard/tests/create");
        }
    };

    const handleRefresh = () => {
        loadTests();
    };

    if (isLoading) {
        return <LoadingState message="Загрузка тестов..." />;
    }

    return (
        <div className={styles.testsContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>{isUserTeacher ? "Мои тесты" : "Доступные тесты"}</h1>
                <div className={styles.headerActions}>
                    <Button variant="secondary" onClick={handleRefresh} disabled={isLoading}>
                        Обновить
                    </Button>
                    {isUserTeacher && (
                        <Button variant="primary" onClick={handleCreateTest}>
                            Создать новый тест
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    <span>{error}</span>
                    <Button variant="outline" size="small" onClick={handleRefresh}>
                        Попробовать снова
                    </Button>
                </div>
            )}

            {tests.length === 0 ? (
                <EmptyState
                    title={isUserTeacher ? "У вас пока нет тестов" : "Нет доступных тестов"}
                    message={
                        isUserTeacher
                            ? "Создайте свой первый тест, чтобы начать работу"
                            : "Пока нет активных тестов для прохождения"
                    }
                    actionText={isUserTeacher ? "Создать первый тест" : undefined}
                    onAction={isUserTeacher ? handleCreateTest : undefined}
                    icon="📝"
                />
            ) : (
                <div className={styles.testsList}>
                    {tests.map((test) => (
                        <TestCard
                            key={test.id}
                            test={test}
                            showCreator={true}
                            onUpdate={handleRefresh}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestsList;
