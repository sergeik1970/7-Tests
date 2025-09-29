import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import TestResults from "@/shared/components/TestResults";
import { getAttempt } from "@/services/api";
import type { TestAttempt } from "@/services/api";

const TestResultsPage = () => {
    const router = useRouter();
    const { testId, attemptId } = router.query;
    const [attempt, setAttempt] = useState<TestAttempt | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (attemptId && typeof attemptId === "string") {
            loadAttempt(parseInt(attemptId));
        }
    }, [attemptId]);

    const loadAttempt = async (attemptId: number) => {
        try {
            setIsLoading(true);
            const attemptData = await getAttempt(attemptId);
            setAttempt(attemptData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки результатов");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка результатов..." />
            </DashboardLayout>
        );
    }

    if (error || !attempt) {
        return (
            <DashboardLayout>
                <ErrorState
                    title="Ошибка загрузки результатов"
                    message={error || "Результаты не найдены"}
                    actionLabel="Вернуться к тестам"
                    onAction={() => router.push("/dashboard/tests")}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <TestResults attempt={attempt} testId={testId} />
        </DashboardLayout>
    );
};

export default TestResultsPage;
