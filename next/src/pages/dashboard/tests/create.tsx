import React, { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/shared/components/DashboardLayout";
import Button from "@/shared/components/Button";
import InputText from "@/shared/components/InputText";
import { useAuth } from "@/contexts/AuthContext";
import { createTest } from "@/services/api";
import { isTeacher } from "@/shared/utils/roles";
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
    if (!user?.role || (!isTeacher(user.role))) {
        router.push('/dashboard');
        return null;
    }

    const addQuestion = () => {
        const newQuestion: Question = {
            text: "",
            type: 'multiple_choice',
            order: testForm.questions.length,
            options: [
                { text: "", isCorrect: false, order: 0 },
                { text: "", isCorrect: false, order: 1 }
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

    const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
        setTestForm(prev => {
            const question = prev.questions[questionIndex];
            const option = question.options?.[optionIndex];
            
            // Не позволяем выбирать пустые варианты как правильные
            if (!option?.text.trim() && !option?.isCorrect) {
                return prev;
            }
            
            return {
                ...prev,
                questions: prev.questions.map((q, i) => 
                    i === questionIndex ? {
                        ...q,
                        options: q.options?.map((opt, j) => 
                            j === optionIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt
                        )
                    } : q
                )
            };
        });
    };

    const getCorrectAnswersCount = (question: Question): number => {
        return question.options?.filter(opt => opt.isCorrect).length || 0;
    };

    const hasCorrectAnswer = (question: Question): boolean => {
        return question.options?.some(opt => opt.isCorrect) || false;
    };

    const handleOptionKeyDown = (questionIndex: number, optionIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        const question = testForm.questions[questionIndex];
        const optionsCount = question.options?.length || 0;
        
        if (e.key === 'ArrowUp' && optionIndex > 0) {
            e.preventDefault();
            // Фокусируемся на предыдущем поле ввода варианта
            const prevInput = document.querySelector(
                `input[data-question="${questionIndex}"][data-option="${optionIndex - 1}"]`
            ) as HTMLInputElement;
            if (prevInput) {
                prevInput.focus();
                // Устанавливаем курсор в конец
                setTimeout(() => {
                    prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
                }, 0);
            }
        } else if (e.key === 'ArrowDown' && optionIndex < optionsCount - 1) {
            e.preventDefault();
            // Фокусируемся на следующем поле ввода варианта
            const nextInput = document.querySelector(
                `input[data-question="${questionIndex}"][data-option="${optionIndex + 1}"]`
            ) as HTMLInputElement;
            if (nextInput) {
                nextInput.focus();
                // Устанавливаем курсор в конец
                setTimeout(() => {
                    nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
                }, 0);
            }
        }
    };

    const handleOptionTextChange = (questionIndex: number, optionIndex: number, value: string) => {
        setTestForm(prev => {
            let newForm = {
                ...prev,
                questions: prev.questions.map((q, i) => 
                    i === questionIndex ? {
                        ...q,
                        options: q.options?.map((opt, j) => 
                            j === optionIndex ? { 
                                ...opt, 
                                text: value,
                                // Если текст становится пустым, снимаем отметку "правильный ответ"
                                isCorrect: value.trim() ? opt.isCorrect : false
                            } : opt
                        )
                    } : q
                )
            };

            const question = newForm.questions[questionIndex];
            const isLastOption = optionIndex === (question.options?.length || 0) - 1;
            const hasLessThan10Options = (question.options?.length || 0) < 10;
            
            // Если это последняя опция и она не пустая, и опций меньше 10 - добавляем новую
            if (value.trim() && isLastOption && hasLessThan10Options) {
                const newOption: QuestionOption = {
                    text: "",
                    isCorrect: false,
                    order: question.options?.length || 0
                };
                
                newForm = {
                    ...newForm,
                    questions: newForm.questions.map((q, i) => 
                        i === questionIndex ? {
                            ...q,
                            options: [...(q.options || []), newOption]
                        } : q
                    )
                };
            }

            // Если поле очищено (не последнее) - сдвигаем все варианты
            if (!value.trim() && !isLastOption) {
                const updatedQuestion = newForm.questions[questionIndex];
                if (updatedQuestion.options && updatedQuestion.options.length > 2) {
                    // Удаляем текущий пустой вариант и сдвигаем остальные
                    const filteredOptions = updatedQuestion.options.filter((_, idx) => idx !== optionIndex);
                    
                    // Если после удаления остается меньше 2 вариантов, добавляем пустой
                    const finalOptions = filteredOptions.length < 2 
                        ? [...filteredOptions, { text: "", isCorrect: false, order: filteredOptions.length }]
                        : filteredOptions;
                    
                    newForm = {
                        ...newForm,
                        questions: newForm.questions.map((q, i) => 
                            i === questionIndex ? {
                                ...q,
                                options: finalOptions.map((opt, idx) => ({
                                    ...opt,
                                    order: idx
                                }))
                            } : q
                        )
                    };
                }
            } else {
                // Удаляем пустые опции в конце (но оставляем минимум 2)
                const updatedQuestion = newForm.questions[questionIndex];
                if (updatedQuestion.options && updatedQuestion.options.length > 2) {
                    // Находим последние пустые опции
                    let lastNonEmptyIndex = updatedQuestion.options.length - 1;
                    while (lastNonEmptyIndex >= 2 && !updatedQuestion.options[lastNonEmptyIndex].text.trim()) {
                        lastNonEmptyIndex--;
                    }
                    
                    // Оставляем только до последней непустой опции + 1 (для ввода новой)
                    if (lastNonEmptyIndex < updatedQuestion.options.length - 1) {
                        const trimmedOptions = updatedQuestion.options.slice(0, lastNonEmptyIndex + 2);
                        
                        newForm = {
                            ...newForm,
                            questions: newForm.questions.map((q, i) => 
                                i === questionIndex ? {
                                    ...q,
                                    options: trimmedOptions.map((opt, idx) => ({
                                        ...opt,
                                        order: idx
                                    }))
                                } : q
                            )
                        };
                    }
                }
            }

            return newForm;
        });
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            // Очищаем пустые варианты ответов перед отправкой
            const cleanedTestForm = {
                ...testForm,
                questions: testForm.questions.map(question => ({
                    ...question,
                    options: question.options?.filter(opt => opt.text.trim() !== "").map((opt, index) => ({
                        ...opt,
                        order: index
                    }))
                }))
            };

            // Проверяем, что у каждого вопроса с выбором ответа есть хотя бы один правильный ответ
            const invalidQuestions = cleanedTestForm.questions.filter(question => 
                question.type === 'multiple_choice' && 
                !hasCorrectAnswer(question)
            );

            if (invalidQuestions.length > 0) {
                setError("Пожалуйста, выберите правильные ответы для всех вопросов с выбором вариантов");
                return;
            }

            const test = await createTest(cleanedTestForm);
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
                                                    { text: "", isCorrect: false, order: 0 },
                                                    { text: "", isCorrect: false, order: 1 }
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
                                                <div 
                                                    className={`${styles.customRadio} ${option.isCorrect ? styles.checked : ''} ${!option.text.trim() ? styles.disabled : ''}`}
                                                    onClick={() => toggleCorrectOption(questionIndex, optionIndex)}
                                                >
                                                    {option.isCorrect && <div className={styles.radioInner}></div>}
                                                </div>
                                                <InputText
                                                    value={option.text}
                                                    onChange={(e) => handleOptionTextChange(questionIndex, optionIndex, e.target.value)}
                                                    onKeyDown={(e) => handleOptionKeyDown(questionIndex, optionIndex, e)}
                                                    placeholder={`Вариант ${optionIndex + 1}`}
                                                    required={optionIndex < 2}
                                                    disabled={isLoading}
                                                    data-question={questionIndex}
                                                    data-option={optionIndex}
                                                />
                                            </div>
                                        ))}
                                        <small className={styles.hint}>
                                            Нажмите на кружки рядом с правильными ответами. Можно выбрать один или несколько. Новые варианты добавляются автоматически при заполнении (до 10 вариантов). Используйте стрелки ↑↓ для навигации между вариантами.
                                            {getCorrectAnswersCount(question) > 1 && (
                                                <span className={styles.multipleAnswers}>
                                                    <br />✓ Выбрано правильных ответов: {getCorrectAnswersCount(question)} из {question.options?.length || 0}
                                                </span>
                                            )}
                                            {!hasCorrectAnswer(question) && (
                                                <span className={styles.noAnswers}>
                                                    <br />⚠️ Не выбран ни один правильный ответ
                                                </span>
                                            )}
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

                        {testForm.questions.length > 0 && (
                            <div className={styles.addQuestionBottom}>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={addQuestion}
                                    disabled={isLoading}
                                >
                                    Добавить еще вопрос
                                </Button>
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