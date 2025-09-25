import React, { useState, useEffect, useCallback } from "react";
import styles from "./TestTimer.module.scss";

interface TestTimerProps {
    /** Начальное время в секундах */
    initialTimeLeft: number;
    /** Callback, который вызывается когда время истекает */
    onTimeUp: () => void;
    /** Показывать ли таймер (если false, таймер скрыт но продолжает работать) */
    visible?: boolean;
    /** Дополнительный CSS класс */
    className?: string;
}

const TestTimer: React.FC<TestTimerProps> = ({
    initialTimeLeft,
    onTimeUp,
    visible = true,
    className = "",
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(initialTimeLeft);

    // Обновляем время при изменении initialTimeLeft
    useEffect(() => {
        setTimeLeft(initialTimeLeft);
    }, [initialTimeLeft]);

    // Основной таймер
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                const newTime = prevTime - 1;
                
                // Отладочная информация
                console.log("Timer tick:", {
                    prevTime,
                    newTime,
                    willCallOnTimeUp: newTime <= 0
                });

                if (newTime <= 0) {
                    onTimeUp();
                    return 0;
                }
                
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = useCallback((seconds: number): string => {
        // Проверяем, что значение корректное
        if (!seconds || seconds < 0 || !isFinite(seconds)) {
            return "0:00";
        }

        // Округляем до целого числа секунд
        const totalSeconds = Math.floor(seconds);

        // Если время больше 24 часов, что-то пошло не так
        if (totalSeconds > 86400) {
            console.warn("Некорректное время:", seconds);
            return "0:00";
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        // Если больше часа, показываем часы
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
        }

        // Иначе показываем только минуты и секунды
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }, []);

    // Определяем стиль в зависимости от оставшегося времени
    const getTimerClass = useCallback(() => {
        if (timeLeft <= 60) return styles.critical; // Меньше минуты - красный
        if (timeLeft <= 300) return styles.warning; // Меньше 5 минут - желтый
        return styles.normal; // Обычное время - зеленый
    }, [timeLeft]);

    if (!visible) {
        return null;
    }

    return (
        <div className={`${styles.testTimer} ${getTimerClass()} ${className}`}>
            <span>{formatTime(timeLeft)}</span>
        </div>
    );
};

export default TestTimer;