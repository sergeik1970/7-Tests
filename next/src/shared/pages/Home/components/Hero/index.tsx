import React, { ReactElement, useState } from "react";
import Button from "@/shared/components/Button";
import styles from "./index.module.scss";
import Link from "next/link";

const Hero = (): ReactElement => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showCongrats, setShowCongrats] = useState(false);
    const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

    const correctAnswer = "B";

    const handleOptionClick = (option: string) => {
        if (selectedOption) return; // Предотвращаем повторные клики

        setSelectedOption(option);

        if (option === correctAnswer) {
            setShowCongrats(true);
            setShowCorrectAnswer(true);
            // Скрываем поздравление через 3 секунды
            setTimeout(() => {
                setShowCongrats(false);
            }, 3000);
        } else {
            // Если ответ неправильный, показываем правильный моментально
            setShowCorrectAnswer(true);
        }
    };

    const getOptionClass = (option: string) => {
        if (!selectedOption) return styles.option;

        if (option === selectedOption) {
            return option === correctAnswer
                ? `${styles.option} ${styles.correct}`
                : `${styles.option} ${styles.incorrect}`;
        }

        // Показываем правильный ответ, если выбран неправильный и прошло время
        if (showCorrectAnswer && option === correctAnswer) {
            return `${styles.option} ${styles.correct}`;
        }

        return `${styles.option} ${styles.disabled}`;
    };
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Создавайте и проводите тесты
                        <span className={styles.highlight}> легко и эффективно</span>
                    </h1>
                    <p className={styles.subtitle}>
                        Современная платформа для создания онлайн-тестов, подходящая как для
                        образовательных учреждений, так и для корпоративного обучения. Получайте
                        детальную аналитику и отчеты.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/auth/register">
                            <Button variant="primary" size="large">
                                Начать бесплатно
                            </Button>
                        </Link>
                        <Link href="/dashboard">
                            <Button variant="outline" size="large">
                                Посмотреть демо
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className={styles.illustration}>
                    <div className={styles.mockup}>
                        <div className={styles.mockupHeader}>
                            <div className={styles.mockupDots}>
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div className={styles.mockupContent}>
                            <div className={styles.mockupTitle}>Математика - Тест №1</div>
                            <div className={styles.mockupQuestion}>
                                <div className={styles.questionText}>
                                    Решите уравнение: 3x - 7 = 14
                                </div>
                                <div className={styles.options}>
                                    <div
                                        className={getOptionClass("A")}
                                        onClick={() => handleOptionClick("A")}
                                    >
                                        A) x = 5
                                    </div>
                                    <div
                                        className={getOptionClass("B")}
                                        onClick={() => handleOptionClick("B")}
                                    >
                                        B) x = 7
                                    </div>
                                    <div
                                        className={getOptionClass("C")}
                                        onClick={() => handleOptionClick("C")}
                                    >
                                        C) x = 9
                                    </div>
                                    <div
                                        className={getOptionClass("D")}
                                        onClick={() => handleOptionClick("D")}
                                    >
                                        D) x = 11
                                    </div>
                                </div>
                                {showCongrats && (
                                    <div className={styles.congratsAnimation}>🎉 Молодец!</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
