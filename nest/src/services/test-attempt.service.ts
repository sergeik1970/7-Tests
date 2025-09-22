import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TestAttempt, AttemptStatus } from "../entities/TestAttempt/testAttempt.entity";
import { TestAnswer } from "../entities/TestAnswer/testAnswer.entity";
import { Test, TestStatus } from "../entities/Test/test.entity";
import { Question, QuestionType } from "../entities/Question/question.entity";
import { QuestionOption } from "../entities/QuestionOption/questionOption.entity";
import { User, UserRole } from "../entities/User/user.entity";
import { StartTestDto } from "../dto/test-attempt/start-test.dto";
import { SubmitAnswerDto } from "../dto/test-attempt/submit-answer.dto";

@Injectable()
export class TestAttemptService {
    constructor(
        @InjectRepository(TestAttempt)
        private testAttemptRepository: Repository<TestAttempt>,
        @InjectRepository(TestAnswer)
        private testAnswerRepository: Repository<TestAnswer>,
        @InjectRepository(Test)
        private testRepository: Repository<Test>,
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private questionOptionRepository: Repository<QuestionOption>,
    ) {}

    async startTest(startTestDto: StartTestDto, userId: number): Promise<TestAttempt> {
        const { testId } = startTestDto;

        // Проверяем, что тест существует и активен
        const test = await this.testRepository.findOne({
            where: { id: testId },
            relations: ["questions", "questions.options"],
        });

        if (!test) {
            throw new NotFoundException("Тест не найден");
        }

        if (test.status !== TestStatus.ACTIVE) {
            throw new BadRequestException("Тест не активен");
        }

        // Проверяем, нет ли уже активной попытки
        const existingAttempt = await this.testAttemptRepository.findOne({
            where: {
                userId,
                testId,
                status: AttemptStatus.IN_PROGRESS,
            },
        });

        if (existingAttempt) {
            // Проверяем, не истекло ли время для существующей попытки
            if (test.timeLimit && existingAttempt.startedAt) {
                const timeElapsed = (new Date().getTime() - existingAttempt.startedAt.getTime()) / (1000 * 60); // в минутах
                if (timeElapsed > test.timeLimit) {
                    // Автоматически завершаем просроченную попытку
                    existingAttempt.status = AttemptStatus.ABANDONED;
                    existingAttempt.completedAt = new Date();
                    await this.testAttemptRepository.save(existingAttempt);
                    throw new BadRequestException("Время прохождения теста истекло. Начните новую попытку.");
                }
            }
            return existingAttempt;
        }

        // Создаем новую попытку с серверным UTC timestamp
        const currentTime = new Date(); // Всегда UTC на сервере
        const attempt = this.testAttemptRepository.create({
            userId,
            testId,
            status: AttemptStatus.IN_PROGRESS,
            startedAt: currentTime,
            totalQuestions: test.questions.length,
        });

        return await this.testAttemptRepository.save(attempt);
    }

    async submitAnswer(attemptId: number, submitAnswerDto: SubmitAnswerDto, userId: number): Promise<TestAnswer> {
        const { questionId, selectedOptionId, textAnswer } = submitAnswerDto;

        // Проверяем попытку
        const attempt = await this.testAttemptRepository.findOne({
            where: { id: attemptId, userId },
            relations: ["test"],
        });

        if (!attempt) {
            throw new NotFoundException("Попытка не найдена");
        }

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Попытка уже завершена");
        }

        // Проверяем, не истекло ли время
        if (attempt.test.timeLimit && attempt.startedAt) {
            const currentTime = new Date();
            const timeElapsed = (currentTime.getTime() - attempt.startedAt.getTime()) / (1000 * 60); // в минутах
            
            if (timeElapsed > attempt.test.timeLimit) {
                // Автоматически завершаем просроченную попытку
                attempt.status = AttemptStatus.ABANDONED;
                attempt.completedAt = currentTime;
                await this.testAttemptRepository.save(attempt);
                throw new BadRequestException("Время прохождения теста истекло");
            }
        }

        // Проверяем вопрос
        const question = await this.questionRepository.findOne({
            where: { id: questionId, testId: attempt.testId },
            relations: ["options"],
        });

        if (!question) {
            throw new NotFoundException("Вопрос не найден");
        }

        // Проверяем, есть ли уже ответ на этот вопрос
        let existingAnswer = await this.testAnswerRepository.findOne({
            where: { attemptId, questionId },
        });

        let isCorrect = false;

        // Проверяем правильность ответа
        if (question.type === QuestionType.MULTIPLE_CHOICE && selectedOptionId) {
            const selectedOption = await this.questionOptionRepository.findOne({
                where: { id: selectedOptionId, questionId },
            });

            if (!selectedOption) {
                throw new BadRequestException("Выбранный вариант не найден");
            }

            isCorrect = selectedOption.isCorrect;
        } else if (question.type === QuestionType.TEXT_INPUT && textAnswer) {
            // Простая проверка текстового ответа (можно улучшить)
            isCorrect = question.correctTextAnswer?.toLowerCase().trim() === textAnswer.toLowerCase().trim();
        }

        if (existingAnswer) {
            // Обновляем существующий ответ
            existingAnswer.selectedOptionId = selectedOptionId || null;
            existingAnswer.textAnswer = textAnswer || null;
            existingAnswer.isCorrect = isCorrect;
            return await this.testAnswerRepository.save(existingAnswer);
        } else {
            // Создаем новый ответ
            const answer = this.testAnswerRepository.create({
                attemptId,
                questionId,
                selectedOptionId: selectedOptionId || null,
                textAnswer: textAnswer || null,
                isCorrect,
            });

            return await this.testAnswerRepository.save(answer);
        }
    }

    async completeTest(attemptId: number, userId: number): Promise<TestAttempt> {
        const attempt = await this.testAttemptRepository.findOne({
            where: { id: attemptId, userId },
            relations: ["answers", "test"],
        });

        if (!attempt) {
            throw new NotFoundException("Попытка не найдена");
        }

        if (attempt.status !== AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("Попытка уже завершена");
        }

        const currentTime = new Date();

        // Проверяем, не истекло ли время (даже при завершении)
        if (attempt.test.timeLimit && attempt.startedAt) {
            const timeElapsed = (currentTime.getTime() - attempt.startedAt.getTime()) / (1000 * 60); // в минутах
            
            if (timeElapsed > attempt.test.timeLimit) {
                // Завершаем как просроченную попытку
                attempt.status = AttemptStatus.ABANDONED;
                attempt.completedAt = currentTime;
                await this.testAttemptRepository.save(attempt);
                throw new BadRequestException("Время прохождения теста истекло");
            }
        }

        // Подсчитываем результаты
        const correctAnswers = attempt.answers.filter(answer => answer.isCorrect).length;
        const score = attempt.totalQuestions > 0 ? (correctAnswers / attempt.totalQuestions) * 100 : 0;

        // Обновляем попытку с серверным timestamp
        attempt.status = AttemptStatus.COMPLETED;
        attempt.completedAt = currentTime;
        attempt.correctAnswers = correctAnswers;
        attempt.score = score;

        return await this.testAttemptRepository.save(attempt);
    }

    async getAttempt(attemptId: number, userId: number): Promise<TestAttempt & { remainingTime?: number }> {
        const attempt = await this.testAttemptRepository.findOne({
            where: { id: attemptId, userId },
            relations: [
                "test",
                "test.questions",
                "test.questions.options",
                "answers",
                "answers.selectedOption",
            ],
        });

        if (!attempt) {
            throw new NotFoundException("Попытка не найдена");
        }

        // Добавляем информацию об оставшемся времени
        let remainingTime: number | undefined;
        if (attempt.test.timeLimit && attempt.startedAt && attempt.status === AttemptStatus.IN_PROGRESS) {
            const currentTime = new Date();
            const timeElapsed = (currentTime.getTime() - attempt.startedAt.getTime()) / (1000 * 60); // в минутах
            remainingTime = Math.max(0, attempt.test.timeLimit - timeElapsed);
            
            // Если время истекло, автоматически завершаем попытку
            if (remainingTime <= 0) {
                attempt.status = AttemptStatus.ABANDONED;
                attempt.completedAt = currentTime;
                await this.testAttemptRepository.save(attempt);
            }
        }

        // Если тест еще в процессе, убираем правильные ответы
        if (attempt.status === AttemptStatus.IN_PROGRESS) {
            if (attempt.test.questions) {
                attempt.test.questions.forEach(question => {
                    if (question.options) {
                        question.options.forEach(option => {
                            option.isCorrect = false; // Скрываем информацию о правильности
                        });
                    }
                    question.correctTextAnswer = null;
                });
            }
        }

        return { ...attempt, remainingTime };
    }

    async getUserAttempts(userId: number): Promise<TestAttempt[]> {
        return await this.testAttemptRepository.find({
            where: { userId },
            relations: ["test"],
            order: { createdAt: "DESC" },
        });
    }

    // Методы для учителей
    async getTestAttempts(testId: number, creatorId: number): Promise<TestAttempt[]> {
        // Проверяем, что тест принадлежит учителю
        const test = await this.testRepository.findOne({
            where: { id: testId, creatorId },
        });

        if (!test) {
            throw new ForbiddenException("У вас нет доступа к этому тесту");
        }

        return await this.testAttemptRepository.find({
            where: { testId },
            relations: [
                "user",
                "test",
                "answers",
                "answers.question",
                "answers.selectedOption",
            ],
            order: { createdAt: "DESC" },
        });
    }

    async getAttemptDetails(attemptId: number, creatorId: number): Promise<TestAttempt> {
        const attempt = await this.testAttemptRepository.findOne({
            where: { id: attemptId },
            relations: [
                "user",
                "test",
                "answers",
                "answers.question",
                "answers.selectedOption",
            ],
        });

        if (!attempt) {
            throw new NotFoundException("Попытка не найдена");
        }

        // Проверяем, что тест принадлежит учителю
        if (attempt.test.creatorId !== creatorId) {
            throw new ForbiddenException("У вас нет доступа к этой попытке");
        }

        return attempt;
    }

    async getTestStatistics(testId: number, creatorId: number) {
        // Проверяем, что тест принадлежит учителю
        const test = await this.testRepository.findOne({
            where: { id: testId, creatorId },
        });

        if (!test) {
            throw new ForbiddenException("У вас нет доступа к этому тесту");
        }

        const attempts = await this.testAttemptRepository.find({
            where: { testId, status: AttemptStatus.COMPLETED },
            relations: ["user"],
        });

        const totalAttempts = attempts.length;
        const averageScore = totalAttempts > 0 
            ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts 
            : 0;

        const passedAttempts = attempts.filter(attempt => (attempt.score || 0) >= 60).length;
        const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

        return {
            testId,
            totalAttempts,
            averageScore: Math.round(averageScore * 100) / 100,
            passRate: Math.round(passRate * 100) / 100,
            attempts: attempts.map(attempt => ({
                id: attempt.id,
                user: {
                    id: attempt.user.id,
                    name: attempt.user.name,
                    email: attempt.user.email,
                },
                score: attempt.score,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                completedAt: attempt.completedAt,
            })),
        };
    }
}