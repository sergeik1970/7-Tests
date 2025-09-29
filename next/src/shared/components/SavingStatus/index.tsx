import React from "react";
import styles from "./index.module.scss";

export type SavingStatusType = "saving" | "saved" | "error";

interface SavingStatusProps {
    status: SavingStatusType;
    className?: string;
}

const SavingStatus: React.FC<SavingStatusProps> = ({ status, className }) => {
    const getStatusText = () => {
        switch (status) {
            case "saving":
                return "💾 Сохранение...";
            case "saved":
                return "✅ Сохранено";
            case "error":
                return "❌ Ошибка сохранения";
            default:
                return "";
        }
    };

    return (
        <div className={`${styles.savingStatus} ${styles[status]} ${className || ""}`}>
            {getStatusText()}
        </div>
    );
};

export default SavingStatus;
