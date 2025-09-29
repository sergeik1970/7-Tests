import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/shared/components/Button";
import TestInfoForm, { TestInfoData } from "@/shared/components/TestInfoForm";
import Questions, { QuestionData } from "@/shared/components/Questions";
import ValidationErrors from "@/shared/components/ValidationErrors";
import FloatingValidation from "@/shared/components/FloatingValidation";
import { createTest, CreateTestData } from "@/services/api";
import styles from "./index.module.scss";

export interface TestForm {
    title: string;
    description: string;
    timeLimit?: number;
    questions: QuestionData[];
}

interface CreateTestProps {
    onSuccess?: (testId: string) => void;
    onError?: (error: string) => void;
}

const CreateTest: React.FC<CreateTestProps> = ({ onSuccess, onError }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Основное состояние формы
    const [testInfo, setTestInfo] = useState<TestInfoData>({
        title: "",
        description: "",
        timeLimit: undefined,
    });

    const [questions, setQuestions] = useState<QuestionData[]>([]);

    // Функция валидации для FloatingValidation
    const getValidationErrors = () => {
        const errors: Array<{ field: string; message: string; questionIndex?: number }> = [];

        // Проверяем основные поля
        if (!testInfo.title.trim()) {
            errors.push({ field: "Название теста", message: "Поле обязательно для заполнения" });
        }

        if (questions.length === 0) {
            errors.push({ field: "Вопросы", message: "Добавьте хотя бы один вопрос" });
        }

        // Проверяем каждый вопрос
        questions.forEach((question, questionIndex) => {
            if (!question.text.trim()) {
                errors.push({
                    field: "Текст вопроса",
                    message: "Не указан текст вопроса",
                    questionIndex,
                });
            }

            // Проверяем вопросы с выбором вариантов
            if (question.type === "single_choice" || question.type === "multiple_choice") {
                const nonEmptyOptions =
                    question.options?.filter((opt) => opt.text.trim() !== "") || [];

                if (nonEmptyOptions.length < 2) {
                    errors.push({
                        field: "Варианты ответов",
                        message: "Должно быть минимум 2 варианта ответа",
                        questionIndex,
                    });
                }

                const hasCorrect = nonEmptyOptions.some((opt) => opt.isCorrect);
                if (!hasCorrect && nonEmptyOptions.length >= 2) {
                    errors.push({
                        field: "Правильный ответ",
                        message: "Не выбран правильный ответ",
                        questionIndex,
                    });
                }

                if (question.type === "single_choice") {
                    const correctCount = nonEmptyOptions.filter((opt) => opt.isCorrect).length;
                    if (correctCount > 1) {
                        errors.push({
                            field: "Правильный ответ",
                            message:
                                "Для одиночного выбора можно выбрать только один правильный ответ",
                            questionIndex,
                        });
                    }
                }
            }

            // Проверяем текстовые вопросы
            if (question.type === "text") {
                if (!question.correctTextAnswer?.trim()) {
                    errors.push({
                        field: "Правильный ответ",
                        message: "Не указан правильный ответ для текстового вопроса",
                        questionIndex,
                    });
                }
            }
        });

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = getValidationErrors();
        if (validationErrors.length > 0) {
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const testData: CreateTestData = {
                title: testInfo.title,
                description: testInfo.description,
                timeLimit: testInfo.timeLimit,
                questions: questions.map((question, index) => ({
                    ...question,
                    type: question.type === "text" ? "text_input" : question.type, // Преобразуем тип для API
                    order: index,
                    options:
                        question.options
                            ?.filter((opt) => opt.text.trim() !== "")
                            .map((opt, optIndex) => ({
                                ...opt,
                                order: optIndex,
                            })) || [],
                })),
            };

            const response = await createTest(testData);

            if (onSuccess && response.id) {
                onSuccess(response.id.toString());
            }

            if (response.id) {
                router.push(`/dashboard/tests/detail?id=${response.id}`);
            }
        } catch (err: any) {
            const errorMessage =
                err.response?.data?.message || "Произошла ошибка при создании теста";
            setError(errorMessage);

            if (onError) {
                onError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const validationErrors = getValidationErrors();
    const isFormValid =
        validationErrors.length === 0 && testInfo.title.trim().length > 0 && questions.length > 0;

    return (
        <div className={styles.createTest}>
            <div className={styles.header}>
                <h1 className={styles.title}>Создание нового теста</h1>
                <p className={styles.subtitle}>Заполните информацию о тесте и добавьте вопросы</p>
            </div>

            {error && (
                <ValidationErrors errors={[error]} title="Ошибка создания теста:" variant="error" />
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <TestInfoForm data={testInfo} onChange={setTestInfo} disabled={isLoading} />

                <Questions questions={questions} onChange={setQuestions} disabled={isLoading} />

                <div className={styles.actions}>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading || !testInfo.title || questions.length === 0}
                    >
                        {isLoading ? "Создание..." : "Создать тест"}
                    </Button>
                </div>
            </form>

            <FloatingValidation errors={validationErrors} isFormValid={isFormValid} />
        </div>
    );
};

export default CreateTest;
