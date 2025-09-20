import React, { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import { useAuth } from "@/contexts/AuthContext";
import { createTest } from "@/services/api";
import styles from "./create.module.scss";

interface QuestionOption {
    text: string;
    isCorrect: boolean;
    order: number;
}

interface Question {
    text: string;
    type: 'multiple_choice' | 'text_input';
    order: number;
    correctTextAnswer?: string;
    options?: QuestionOption[];
}

interface TestForm {
    title: string;
    description: string;
    timeLimit?: number;
    questions: Question[];
}

const CreateTestPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const [testForm, setTestForm] = useState<TestForm>({
        title: "",
        description: "",
        timeLimit: undefined,
        questions: []
    });

    // Проверяем права доступа
    if (user?.role !== 'creator') {
        router.push('/dashboard');
        return null;
    }

    const addQuestion = () => {
        const newQuestion: Question = {
            text: "",
            type: 'multiple_choice',
            order: testForm.questions.length,
            options: [
                { text: "", isCorrect: true, order: 0 },
                { text: "", isCorrect: false, order: 1 },
                { text: "", isCorrect: false, order: 2 },
                { text: "", isCorrect: false, order: 3 }
            ]
        };
        
        setTestForm(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const removeQuestion = (index: number) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === index ? { ...q, [field]: value } : q
            )
        }));
    };

    const updateQuestionOption = (questionIndex: number, optionIndex: number, field: keyof QuestionOption, value: any) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === questionIndex ? {
                    ...q,
                    options: q.options?.map((opt, j) => 
                        j === optionIndex ? { ...opt, [field]: value } : opt
                    )
                } : q
            )
        }));
    };

    const setCorrectOption = (questionIndex: number, optionIndex: number) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => 
                i === questionIndex ? {
                    ...q,
                    options: q.options?.map((opt, j) => ({
                        ...opt,
                        isCorrect: j === optionIndex
                    }))
                } : q
            )
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const test = await createTest(testForm);
            router.push(`/dashboard/tests/${test.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ошибка создания теста");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className={styles.createTest}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Создание нового теста</h1>
                    <Button 
                        variant="outline" 
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Отмена
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Основная информация</h2>
                        
                        <div className={styles.field}>
                            <label className={styles.label}>Название теста *</label>
                            <InputText
                                value={testForm.title}
                                onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Введите название теста"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Описание</label>
                            <textarea
                                className={styles.textarea}
                                value={testForm.description}
                                onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Введите описание теста"
                                disabled={isLoading}
                                rows={3}
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>Время на прохождение (минуты)</label>
                            <InputText
                                type="number"
                                value={testForm.timeLimit?.toString() || ""}
                                onChange={(e) => setTestForm(prev => ({ 
                                    ...prev, 
                                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined 
                                }))}
                                placeholder="Не ограничено"
                                min="1"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Вопросы</h2>
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={addQuestion}
                                disabled={isLoading}
                            >
                                Добавить вопрос
                            </Button>
                        </div>

                        {testForm.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className={styles.questionCard}>
                                <div className={styles.questionHeader}>
                                    <h3 className={styles.questionTitle}>Вопрос {questionIndex + 1}</h3>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="small"
                                        onClick={() => removeQuestion(questionIndex)}
                                        disabled={isLoading}
                                    >
                                        Удалить
                                    </Button>
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Текст вопроса *</label>
                                    <textarea
                                        className={styles.textarea}
                                        value={question.text}
                                        onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                                        placeholder="Введите текст вопроса"
                                        required
                                        disabled={isLoading}
                                        rows={2}
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label className={styles.label}>Тип вопроса</label>
                                    <select
                                        className={styles.select}
                                        value={question.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as 'multiple_choice' | 'text_input';
                                            updateQuestion(questionIndex, 'type', newType);
                                            
                                            if (newType === 'text_input') {
                                                updateQuestion(questionIndex, 'options', undefined);
                                                updateQuestion(questionIndex, 'correctTextAnswer', '');
                                            } else {
                                                updateQuestion(questionIndex, 'correctTextAnswer', undefined);
                                                updateQuestion(questionIndex, 'options', [
                                                    { text: "", isCorrect: true, order: 0 },
                                                    { text: "", isCorrect: false, order: 1 },
                                                    { text: "", isCorrect: false, order: 2 },
                                                    { text: "", isCorrect: false, order: 3 }
                                                ]);
                                            }
                                        }}
                                        disabled={isLoading}
                                    >
                                        <option value="multiple_choice">Выбор из вариантов</option>
                                        <option value="text_input">Текстовый ответ</option>
                                    </select>
                                </div>

                                {question.type === 'multiple_choice' && question.options && (
                                    <div className={styles.options}>
                                        <label className={styles.label}>Варианты ответов</label>
                                        {question.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className={styles.option}>
                                                <input
                                                    type="radio"
                                                    name={`question-${questionIndex}-correct`}
                                                    checked={option.isCorrect}
                                                    onChange={() => setCorrectOption(questionIndex, optionIndex)}
                                                    disabled={isLoading}
                                                />
                                                <InputText
                                                    value={option.text}
                                                    onChange={(e) => updateQuestionOption(questionIndex, optionIndex, 'text', e.target.value)}
                                                    placeholder={`Вариант ${optionIndex + 1}`}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        ))}
                                        <small className={styles.hint}>
                                            Выберите правильный ответ с помощью радиокнопки
                                        </small>
                                    </div>
                                )}

                                {question.type === 'text_input' && (
                                    <div className={styles.field}>
                                        <label className={styles.label}>Правильный ответ *</label>
                                        <InputText
                                            value={question.correctTextAnswer || ""}
                                            onChange={(e) => updateQuestion(questionIndex, 'correctTextAnswer', e.target.value)}
                                            placeholder="Введите правильный ответ"
                                            required
                                            disabled={isLoading}
                                        />
                                        <small className={styles.hint}>
                                            Ответ будет проверяться без учета регистра и лишних пробелов
                                        </small>
                                    </div>
                                )}
                            </div>
                        ))}

                        {testForm.questions.length === 0 && (
                            <div className={styles.emptyState}>
                                <p>Пока нет вопросов. Добавьте первый вопрос для начала.</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Button 
                            type="submit" 
                            variant="primary"
                            disabled={isLoading || !testForm.title || testForm.questions.length === 0}
                        >
                            {isLoading ? "Создание..." : "Создать тест"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CreateTestPage;