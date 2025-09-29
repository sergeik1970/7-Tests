import React from "react";
import styles from "./index.module.scss";

export type TestStatus = "draft" | "active" | "completed";

export interface StatusBadgeProps {
    status: TestStatus;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const getStatusText = (status: TestStatus): string => {
        switch (status) {
            case "draft":
                return "Черновик";
            case "active":
                return "Активный";
            case "completed":
                return "Завершен";
            default:
                return status;
        }
    };

    const getStatusClass = (status: TestStatus): string => {
        switch (status) {
            case "draft":
                return styles.statusDraft;
            case "active":
                return styles.statusActive;
            case "completed":
                return styles.statusCompleted;
            default:
                return "";
        }
    };

    return (
        <span className={`${styles.statusBadge} ${getStatusClass(status)} ${className || ""}`}>
            {getStatusText(status)}
        </span>
    );
};

export default StatusBadge;
