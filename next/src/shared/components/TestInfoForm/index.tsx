import React from "react";
import InputText from "@/shared/components/InputText";
import styles from "./index.module.scss";

export interface TestInfoData {
    title: string;
    description: string;
    timeLimit?: number;
}

interface TestInfoFormProps {
    data: TestInfoData;
    onChange: (data: TestInfoData) => void;
    disabled?: boolean;
}

const TestInfoForm: React.FC<TestInfoFormProps> = ({ data, onChange, disabled = false }) => {
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...data,
            title: e.target.value,
        });
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange({
            ...data,
            description: e.target.value,
        });
    };

    const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({
            ...data,
            timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
        });
    };

    return (
        <div className={styles.testInfoForm}>
            <h2 className={styles.sectionTitle}>Основная информация</h2>

            <div className={styles.field}>
                <label className={styles.label}>Название теста *</label>
                <InputText
                    value={data.title}
                    onChange={handleTitleChange}
                    placeholder="Введите название теста"
                    required
                    disabled={disabled}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Описание</label>
                <textarea
                    className={styles.textarea}
                    value={data.description}
                    onChange={handleDescriptionChange}
                    placeholder="Введите описание теста"
                    disabled={disabled}
                    rows={3}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>Время на прохождение (минуты)</label>
                <InputText
                    type="number"
                    value={data.timeLimit?.toString() || ""}
                    onChange={handleTimeLimitChange}
                    placeholder="Не ограничено"
                    min="1"
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default TestInfoForm;
