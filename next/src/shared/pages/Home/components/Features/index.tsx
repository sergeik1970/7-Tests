import React, { ReactElement } from "react";
import styles from "./index.module.scss";

const Features = (): ReactElement => {
    const features = [
        {
            icon: "📝",
            title: "Простое создание тестов",
            description:
                "Интуитивный конструктор тестов с поддержкой различных типов вопросов: выбор из вариантов, открытые вопросы, сопоставление.",
        },
        {
            icon: "📊",
            title: "Детальная аналитика",
            description:
                "Получайте подробные отчеты о результатах тестирования, статистику по вопросам и прогресс учащихся.",
        },
        {
            icon: "👥",
            title: "Управление группами",
            description:
                "Создавайте группы учащихся, назначайте тесты, отслеживайте прогресс каждого ученика.",
        },
        {
            icon: "⏱️",
            title: "Гибкие настройки",
            description:
                "Устанавливайте время на прохождение, количество попыток, даты начала и окончания тестирования.",
        },
        {
            icon: "🔒",
            title: "Безопасность",
            description:
                "Защита от списывания: случайный порядок вопросов, ограничение времени, блокировка переключения вкладок.",
        },
        {
            icon: "📱",
            title: "Мобильная версия",
            description:
                "Полная поддержка мобильных устройств - проходите тесты с любого устройства в любое время.",
        },
    ];

    return (
        <section className={styles.features} id="features">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Все необходимое для эффективного тестирования</h2>
                    <p className={styles.subtitle}>
                        Наша платформа предоставляет полный набор инструментов для создания,
                        проведения и анализа результатов тестирования
                    </p>
                </div>
                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.icon}>{feature.icon}</div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
