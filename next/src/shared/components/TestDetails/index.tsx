import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/shared/components/Button";
import TestPreview from "@/shared/components/TestPreview";
import StatusBadge from "@/shared/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { publishTest, deactivateTest, deleteTest, startTest } from "@/services/api";
import type { Test } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
import styles from "./TestDetails.module.scss";

interface TestDetailsProps {
    test: Test;
    onTestUpdate?: (updatedTest: Test) => void;
    onTestDelete?: () => void;
    onError?: (error: string) => void;
}

const TestDetails: React.FC<TestDetailsProps> = ({ test, onTestUpdate, onTestDelete, onError }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleError = (error: string) => {
        setLocalError(error);
        if (onError) {
            onError(error);
        }
    };

    const handlePublish = async () => {
        try {
            setIsPublishing(true);
            setLocalError("");
            const updatedTest = await publishTest(test.id!);
            if (onTestUpdate) {
                onTestUpdate(updatedTest);
            }
        } catch (err) {
            handleError(err instanceof Error ? err.message : "Ошибка публикации теста");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDeactivate = async () => {
        if (
            !confirm(
                "Вы уверены, что хотите деактивировать тест? Ученики больше не смогут его проходить.",
            )
        ) {
            return;
        }

        try {
            setIsDeactivating(true);
            setLocalError("");
            const updatedTest = await deactivateTest(test.id!);
            if (onTestUpdate) {
                onTestUpdate(updatedTest);
            }
        } catch (err) {
            handleError(err instanceof Error ? err.message : "Ошибка деактивации теста");
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Вы уверены, что хотите удалить этот тест?")) return;

        try {
            setIsDeleting(true);
            setLocalError("");
            await deleteTest(test.id!);
            if (onTestDelete) {
                onTestDelete();
            } else {
                router.push("/dashboard/tests");
            }
        } catch (err) {
            handleError(err instanceof Error ? err.message : "Ошибка удаления теста");
            setIsDeleting(false);
        }
    };

    const handleStartTest = async () => {
        try {
            setIsStarting(true);
            setLocalError("");
            const attempt = await startTest(test.id!);
            router.push(`/dashboard/tests/take?testId=${test.id}&attemptId=${attempt.id}`);
        } catch (err) {
            handleError(err instanceof Error ? err.message : "Ошибка начала теста");
            setIsStarting(false);
        }
    };

    const handleEdit = () => {
        router.push(`/dashboard/tests/edit?id=${test.id}`);
    };

    const isOwner = user?.role && isTeacher(user.role) && test.creator?.id === user.id;

    return (
        <div className={styles.testDetails}>
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
                                onClick={handleEdit}
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

            {localError && (
                <div className={styles.errorMessage}>
                    <div className={styles.errorContent}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <span>{localError}</span>
                        <button className={styles.errorClose} onClick={() => setLocalError("")}>
                            ×
                        </button>
                    </div>
                </div>
            )}

            <TestPreview
                test={test}
                isOwner={!!isOwner}
                isStarting={isStarting}
                onStartTest={handleStartTest}
            />
        </div>
    );
};

export default TestDetails;
