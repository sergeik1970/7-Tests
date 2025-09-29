import React from "react";
import Button from "@/shared/components/Button";
import type { Test } from "@/services/api";
import styles from "./index.module.scss";

interface TestPreviewProps {
    test: Test;
    isOwner: boolean;
    isStarting: boolean;
    onStartTest: () => void;
}

const TestPreview: React.FC<TestPreviewProps> = ({
    test,
    isOwner,
    isStarting,
    onStartTest,
}) => {
    return (
        <div className={styles.content}>
            <div className={styles.info}>
                <div className={styles.infoItem}>
                    <strong>Описание:</strong>
                    <p>{test.description || "Описание не указано"}</p>
                </div>
                
                <div className={styles.infoItem}>
                    <strong>Время на прохождение:</strong>
                    <p>{test.timeLimit ? `${test.timeLimit} минут` : "Не ограничено"}</p>
                </div>
                
                <div className={styles.infoItem}>
                    <strong>Количество вопросов:</strong>
                    <p>{test.questions.length}</p>
                </div>
                
                {test.creator && (
                    <div className={styles.infoItem}>
                        <strong>Автор:</strong>
                        <p>{test.creator.name}</p>
                    </div>
                )}
            </div>

            {isOwner && (
                <div className={styles.questions}>
                    <h2 className={styles.sectionTitle}>Вопросы</h2>
                    
                    {test.questions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>В тесте пока нет вопросов</p>
                        </div>
                    ) : (
                        <div className={styles.questionsList}>
                            {test.questions.map((question, index) => (
                                <div key={question.id || index} className={styles.questionCard}>
                                    <div className={styles.questionHeader}>
                                        <h3 className={styles.questionTitle}>
                                            Вопрос {index + 1}
                                        </h3>
                                        <span className={styles.questionType}>
                                            {question.type === 'multiple_choice' ? 'Выбор из вариантов' : 'Текстовый ответ'}
                                        </span>
                                    </div>
                                    
                                    <p className={styles.questionText}>{question.text}</p>
                                    
                                    {question.type === 'multiple_choice' && question.options && (
                                        <div className={styles.options}>
                                            {question.options.map((option, optionIndex) => (
                                                <div 
                                                    key={optionIndex} 
                                                    className={`${styles.option} ${option.isCorrect ? styles.correctOption : ''}`}
                                                >
                                                    <span className={styles.optionMarker}>
                                                        {option.isCorrect ? '✓' : '○'}
                                                    </span>
                                                    <span className={styles.optionText}>
                                                        {option.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {question.type === 'text_input' && question.correctTextAnswer && (
                                        <div className={styles.textAnswer}>
                                            <strong>Правильный ответ:</strong> {question.correctTextAnswer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {!isOwner && test.status === 'active' && (
                <div className={styles.studentInfo}>
                    <div className={styles.infoCard}>
                        <h3>Готовы начать тест?</h3>
                        <p>После начала теста у вас будет {test.timeLimit ? `${test.timeLimit} минут` : 'неограниченное время'} на прохождение.</p>
                        <p>Тест содержит {test.questions.length} {test.questions.length === 1 ? 'вопрос' : test.questions.length < 5 ? 'вопроса' : 'вопросов'}.</p>
                        
                        <div className={styles.startTestSection}>
                            <Button
                                variant="primary"
                                onClick={onStartTest}
                                disabled={isStarting || test.questions.length === 0}
                                className={styles.startButton}
                            >
                                {isStarting ? "Начинаем..." : "Начать тест"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPreview;