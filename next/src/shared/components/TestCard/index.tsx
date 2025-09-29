import React from "react";
import { useRouter } from "next/router";
import Button from "../Button";
import StatusBadge from "../StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { isTeacher } from "@/shared/utils/roles";
import type { Test } from "@/services/api";
import styles from "./index.module.scss";

interface TestCardProps {
    test: Test;
    showCreator?: boolean;
    className?: string;
}

const TestCard: React.FC<TestCardProps> = ({
    test,
    showCreator = false,
    className,
}) => {
    const router = useRouter();
    const { user } = useAuth();

    const handleViewTest = () => {
        router.push(`/dashboard/tests/${test.id}`);
    };

    return (
        <div className={`${styles.testCard} ${className || ""}`}>
            <div className={styles.testInfo}>
                <div className={styles.testHeader}>
                    <h3 className={styles.testName}>{test.title}</h3>
                    <StatusBadge status={test.status} />
                </div>
                
                {test.description && (
                    <p className={styles.testDescription}>
                        {test.description}
                    </p>
                )}
                
                <div className={styles.testMeta}>
                    <span className={styles.metaItem}>
                        📝 {test.questions.length} вопросов
                    </span>
                    {test.timeLimit && (
                        <span className={styles.metaItem}>
                            ⏱️ {test.timeLimit} мин
                        </span>
                    )}
                    {showCreator && test.creator && user?.role && !isTeacher(user.role) && (
                        <span className={styles.metaItem}>
                            👨‍🏫 {test.creator.name}
                        </span>
                    )}
                </div>
            </div>
            
            <div className={styles.testActions}>
                <Button
                    variant="outline"
                    size="small"
                    onClick={handleViewTest}
                >
                    Подробнее
                </Button>
            </div>
        </div>
    );
};

export default TestCard;