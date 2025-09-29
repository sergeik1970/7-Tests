import React from "react";
import styles from "./index.module.scss";

interface TestStatistic {
    id: number;
    title: string;
    status: string;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
    createdAt: string;
}

interface TestStatisticsTableProps {
    data: TestStatistic[];
    className?: string;
    onTestClick?: (testId: number) => void;
}

const TestStatisticsTable = ({ data, className, onTestClick }: TestStatisticsTableProps) => {
    const getStatusText = (status: string) => {
        switch (status) {
            case "active":
                return "Активный";
            case "draft":
                return "Черновик";
            case "completed":
                return "Завершен";
            default:
                return status;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case "active":
                return styles.statusActive;
            case "draft":
                return styles.statusDraft;
            case "completed":
                return styles.statusCompleted;
            default:
                return "";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const handleRowClick = (testId: number) => {
        if (onTestClick) {
            onTestClick(testId);
        }
    };

    if (data.length === 0) {
        return (
            <div className={`${styles.testsSection} ${className || ""}`}>
                <h2 className={styles.sectionTitle}>Статистика по тестам</h2>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>У вас пока нет тестов</h3>
                    <p>Создайте первый тест, чтобы увидеть статистику</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.testsSection} ${className || ""}`}>
            <h2 className={styles.sectionTitle}>Статистика по тестам</h2>
            <div className={styles.tableContainer}>
                <div className={styles.testsTable}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableCell}>Название теста</div>
                        <div className={styles.tableCell}>Статус</div>
                        <div className={styles.tableCell}>Попыток</div>
                        <div className={styles.tableCell}>Завершено</div>
                        <div className={styles.tableCell}>Средний балл</div>
                        <div className={styles.tableCell}>Создан</div>
                    </div>
                    {data.map((test) => (
                        <div
                            key={test.id}
                            className={`${styles.tableRow} ${onTestClick ? styles.clickable : ""}`}
                            onClick={() => handleRowClick(test.id)}
                        >
                            <div className={styles.tableCell}>
                                <div className={styles.testTitle}>{test.title}</div>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={`${styles.status} ${getStatusClass(test.status)}`}>
                                    {getStatusText(test.status)}
                                </span>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={styles.number}>{test.totalAttempts}</span>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={styles.number}>{test.completedAttempts}</span>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={styles.score}>
                                    {test.averageScore > 0 ? `${test.averageScore}%` : "—"}
                                </span>
                            </div>
                            <div className={styles.tableCell}>
                                <span className={styles.date}>{formatDate(test.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TestStatisticsTable;