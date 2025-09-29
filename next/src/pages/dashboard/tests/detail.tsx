import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import TestDetails from "@/shared/components/TestDetails";
import { getTest } from "@/services/api";
import type { Test } from "@/services/api";

const TestDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id && typeof id === "string") {
            loadTest(parseInt(id));
        }
    }, [id]);

    const loadTest = async (testId: number) => {
        try {
            setIsLoading(true);
            const testData = await getTest(testId);
            setTest(testData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка загрузки теста");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestUpdate = (updatedTest: Test) => {
        setTest(updatedTest);
    };

    const handleTestDelete = () => {
        router.push("/dashboard/tests");
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <LoadingState message="Загрузка теста..." />
            </DashboardLayout>
        );
    }

    if (error || !test) {
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
            <TestDetails
                test={test}
                onTestUpdate={handleTestUpdate}
                onTestDelete={handleTestDelete}
                onError={handleError}
            />
        </DashboardLayout>
    );
};

export default TestDetailPage;
