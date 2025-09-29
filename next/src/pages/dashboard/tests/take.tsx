import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import TestTaking from "@/shared/components/TestTaking";
import { getAttempt } from "@/services/api";
import type { TestAttempt } from "@/services/api";

const TakeTestPage = () => {
    const router = useRouter();
    const { attemptId } = router.query;
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
            setError("");
            const attemptData = await getAttempt(attemptId);
            setAttempt(attemptData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки теста");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestComplete = (attemptId: number) => {
        router.push(`/dashboard/tests/results?testId=${attempt?.testId}&attemptId=${attemptId}`);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка теста..." />
            </DashboardLayout>
        );
    }

    if (error || !attempt) {
        return (
            <DashboardLayout>
                <ErrorState
                    title="Ошибка загрузки теста"
                    message={error || "Тест не найден"}
                    actionLabel="Вернуться к тестам"
                    onAction={() => router.push("/dashboard/tests")}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <TestTaking attempt={attempt} onComplete={handleTestComplete} />
        </DashboardLayout>
    );
};

export default TakeTestPage;
