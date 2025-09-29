import React from "react";
import styles from "./index.module.scss";

interface OverviewData {
    totalTests: number;
    activeTests: number;
    draftTests: number;
    totalStudents: number;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
}

interface StatisticsOverviewProps {
    data: OverviewData;
    className?: string;
}

const StatisticsOverview = ({ data, className }: StatisticsOverviewProps) => {
    const statsCards = [
        {
            icon: "📝",
            number: data.totalTests,
            label: "Всего тестов",
            details: `${data.activeTests} активных, ${data.draftTests} черновиков`,
        },
        {
            icon: "👥",
            number: data.totalStudents,
            label: "Учеников",
            details: "Прошли ваши тесты",
        },
        {
            icon: "🎯",
            number: data.totalAttempts,
            label: "Попыток",
            details: `${data.completedAttempts} завершено`,
        },
        {
            icon: "⭐",
            number: `${data.averageScore}%`,
            label: "Средний балл",
            details: "По всем тестам",
        },
    ];

    return (
        <div className={`${styles.overviewSection} ${className || ""}`}>
            <h2 className={styles.sectionTitle}>Общая статистика</h2>
            <div className={styles.statsGrid}>
                {statsCards.map((card, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon}>{card.icon}</div>
                        <div className={styles.statContent}>
                            <div className={styles.statNumber}>{card.number}</div>
                            <div className={styles.statLabel}>{card.label}</div>
                            <div className={styles.statDetails}>{card.details}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatisticsOverview;
