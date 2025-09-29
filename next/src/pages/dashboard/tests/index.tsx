import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import StatusBadge from "@/shared/components/StatusBadge";
import LoadingState from "@/shared/components/LoadingState";
import EmptyState from "@/shared/components/EmptyState";
import TestCard from "@/shared/components/TestCard";
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



    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка тестов..." />
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
                    <EmptyState
                        title={user?.role && isTeacher(user.role)
                            ? 'У вас пока нет тестов' 
                            : 'Нет доступных тестов'
                        }
                        message={user?.role && isTeacher(user.role)
                            ? 'Создайте свой первый тест, чтобы начать работу' 
                            : 'Пока нет активных тестов для прохождения'
                        }
                        actionText={user?.role && isTeacher(user.role) ? 'Создать первый тест' : undefined}
                        onAction={user?.role && isTeacher(user.role) 
                            ? () => router.push('/dashboard/tests/create')
                            : undefined
                        }
                        icon="📝"
                    />
                ) : (
                    <div className={styles.testsList}>
                        {tests.map((test) => (
                            <TestCard
                                key={test.id}
                                test={test}
                                showCreator={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default TestsListPage;