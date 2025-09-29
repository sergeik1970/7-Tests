import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import TestPreview from "@/shared/components/TestPreview";
import StatusBadge from "@/shared/components/StatusBadge";
import LoadingState from "@/shared/components/LoadingState";
import ErrorState from "@/shared/components/ErrorState";
import { useAuth } from "@/contexts/AuthContext";
import { getTest, publishTest, deactivateTest, deleteTest, startTest } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./test-detail.module.scss";

const TestDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const [test, setTest] = useState<Test | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
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

    const handlePublish = async () => {
        if (!test) return;

        try {
            setIsPublishing(true);
            const updatedTest = await publishTest(test.id!);
            setTest(updatedTest);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка публикации теста");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeactivate = async () => {
        if (!test) return;

        if (
            !confirm(
                "Вы уверены, что хотите деактивировать тест? Ученики больше не смогут его проходить.",
            )
        ) {
            return;
        }

        try {
            setIsDeactivating(true);
            const updatedTest = await deactivateTest(test.id!);
            setTest(updatedTest);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка деактивации теста");
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDelete = async () => {
        if (!test || !confirm("Вы уверены, что хотите удалить этот тест?")) return;

        try {
            setIsDeleting(true);
            await deleteTest(test.id!);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка удаления теста");
            setIsDeleting(false);
        }
    };

    const handleStartTest = async () => {
        if (!test) return;

        try {
            setIsStarting(true);
            const attempt = await startTest(test.id!);
            router.push(`/dashboard/tests/${test.id}/take/${attempt.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка начала теста");
            setIsStarting(false);
        }
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
                    message={error || "Тест не найден"}
                    onAction={() => router.push("/dashboard")}
                />
            </DashboardLayout>
        );
    }

    const isOwner = user?.role && isTeacher(user.role) && test.creator?.id === user.id;

    return (
        <DashboardLayout>
            <div className={styles.testDetail}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <h1 className={styles.title}>{test.title}</h1>
                        <StatusBadge status={test.status as any} />
                    </div>

                    <div className={styles.actions}>
                        {isOwner && (
                            <>
                                {test.status === "draft" && (
                                    <Button
                                        variant="primary"
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                    >
                                        {isPublishing ? "Публикация..." : "Опубликовать"}
                                    </Button>
                                )}

                                {test.status === "active" && (
                                    <Button
                                        variant="outline"
                                        onClick={handleDeactivate}
                                        disabled={isDeactivating}
                                        className={styles.deactivateButton}
                                    >
                                        {isDeactivating ? "Деактивация..." : "Деактивировать"}
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    onClick={() => router.push(`/dashboard/tests/${test.id}/edit`)}
                                    disabled={isPublishing || isDeleting}
                                >
                                    Редактировать
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={isPublishing || isDeleting}
                                    className={styles.deleteButton}
                                >
                                    {isDeleting ? "Удаление..." : "Удалить"}
                                </Button>
                            </>
                        )}

                        <Button variant="outline" onClick={() => router.back()}>
                            Назад
                        </Button>
                    </div>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <TestPreview
                    test={test}
                    isOwner={!!isOwner}
                    isStarting={isStarting}
                    onStartTest={handleStartTest}
                />
            </div>
        </DashboardLayout>
    );
};

export default TestDetailPage;
