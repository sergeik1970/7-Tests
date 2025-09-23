import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test, TestStatus } from '../entities/Test/test.entity';
import { Question, QuestionType } from '../entities/Question/question.entity';
import { QuestionOption } from '../entities/QuestionOption/questionOption.entity';
import { TestAttempt, AttemptStatus } from '../entities/TestAttempt/testAttempt.entity';
import { CreateTestDto } from '../dto/test/create-test.dto';
import { UpdateTestDto } from '../dto/test/update-test.dto';
import { User, UserRole } from '../entities/User/user.entity';

@Injectable()
export class TestService {
    constructor(
        @InjectRepository(Test)
        private testRepository: Repository<Test>,
        @InjectRepository(Question)
        private questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption)
        private questionOptionRepository: Repository<QuestionOption>,
        @InjectRepository(TestAttempt)
        private testAttemptRepository: Repository<TestAttempt>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(createTestDto: CreateTestDto, creatorId: number): Promise<Test> {
        // Проверяем, что пользователь - учитель или преподаватель
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator || (creator.role !== UserRole.TEACHER && creator.role !== UserRole.PROFESSOR)) {
            throw new ForbiddenException('Только учителя и преподаватели могут создавать тесты');
        }

        // Создаем тест
        const test = this.testRepository.create({
            title: createTestDto.title,
            description: createTestDto.description,
            timeLimit: createTestDto.timeLimit,
            creatorId,
            status: TestStatus.DRAFT,
        });

        const savedTest = await this.testRepository.save(test);

        // Создаем вопросы
        for (const questionDto of createTestDto.questions) {
            const question = this.questionRepository.create({
                text: questionDto.text,
                type: questionDto.type,
                order: questionDto.order,
                correctTextAnswer: questionDto.correctTextAnswer,
                testId: savedTest.id,
            });

            const savedQuestion = await this.questionRepository.save(question);

            // Создаем варианты ответов для вопросов с выбором
            if (questionDto.type === QuestionType.MULTIPLE_CHOICE && questionDto.options) {
                for (const optionDto of questionDto.options) {
                    const option = this.questionOptionRepository.create({
                        text: optionDto.text,
                        isCorrect: optionDto.isCorrect || false,
                        order: optionDto.order,
                        questionId: savedQuestion.id,
                    });

                    await this.questionOptionRepository.save(option);
                }
            }
        }

        return this.findOne(savedTest.id, creatorId);
    }

    async findAll(creatorId: number): Promise<Test[]> {
        return this.testRepository.find({
            where: { creatorId },
            relations: ['questions', 'questions.options'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number, userId?: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id },
            relations: ['creator', 'questions', 'questions.options'],
        });

        if (!test) {
            throw new NotFoundException('Тест не найден');
        }

        // Если указан userId, проверяем права доступа
        if (userId && test.creatorId !== userId && test.status === TestStatus.DRAFT) {
            throw new ForbiddenException('Нет доступа к этому тесту');
        }

        return test;
    }

    // Метод для получения теста учеником (без правильных ответов)
    async findOneForStudent(id: number): Promise<Test> {
        const test = await this.testRepository.findOne({
            where: { id, status: TestStatus.ACTIVE },
            relations: ['creator', 'questions', 'questions.options'],
        });

        if (!test) {
            throw new NotFoundException('Тест не найден или не активен');
        }

        // Убираем правильные ответы из вариантов
        if (test.questions) {
            test.questions.forEach(question => {
                if (question.options) {
                    question.options.forEach(option => {
                        option.isCorrect = false; // Скрываем информацию о правильности, но оставляем варианты
                    });
                }
                // Убираем правильный текстовый ответ
                question.correctTextAnswer = null;
            });
        }

        return test;
    }

    async update(id: number, updateTestDto: UpdateTestDto, creatorId: number): Promise<Test> {
        const test = await this.findOne(id, creatorId);

        if (test.creatorId !== creatorId) {
            throw new ForbiddenException('Нет прав для редактирования этого теста');
        }

        // Обновляем основную информацию о тесте
        await this.testRepository.update(id, {
            title: updateTestDto.title,
            description: updateTestDto.description,
            timeLimit: updateTestDto.timeLimit,
        });

        // Если есть вопросы для обновления, удаляем старые и создаем новые
        if (updateTestDto.questions) {
            // Удаляем старые вопросы (каскадно удалятся и варианты ответов)
            await this.questionRepository.delete({ testId: id });

            // Создаем новые вопросы
            for (const questionDto of updateTestDto.questions) {
                const question = this.questionRepository.create({
                    text: questionDto.text,
                    type: questionDto.type,
                    order: questionDto.order,
                    correctTextAnswer: questionDto.correctTextAnswer,
                    testId: id,
                });

                const savedQuestion = await this.questionRepository.save(question);

                // Создаем варианты ответов
                if (questionDto.type === QuestionType.MULTIPLE_CHOICE && questionDto.options) {
                    for (const optionDto of questionDto.options) {
                        const option = this.questionOptionRepository.create({
                            text: optionDto.text,
                            isCorrect: optionDto.isCorrect || false,
                            order: optionDto.order,
                            questionId: savedQuestion.id,
                        });

                        await this.questionOptionRepository.save(option);
                    }
                }
            }
        }

        return this.findOne(id, creatorId);
    }

    async publish(id: number, creatorId: number): Promise<Test> {
        const test = await this.findOne(id, creatorId);

        if (test.creatorId !== creatorId) {
            throw new ForbiddenException('Нет прав для публикации этого теста');
        }

        if (test.status !== TestStatus.DRAFT) {
            throw new ForbiddenException('Можно публиковать только черновики');
        }

        // Проверяем, что у теста есть вопросы
        if (!test.questions || test.questions.length === 0) {
            throw new ForbiddenException('Нельзя публиковать тест без вопросов');
        }

        // Проверяем, что у всех вопросов с выбором есть правильные ответы
        for (const question of test.questions) {
            if (question.type === QuestionType.MULTIPLE_CHOICE) {
                const hasCorrectOption = question.options?.some(option => option.isCorrect);
                if (!hasCorrectOption) {
                    throw new ForbiddenException(`Вопрос "${question.text}" должен иметь правильный ответ`);
                }
            }
        }

        await this.testRepository.update(id, { status: TestStatus.ACTIVE });
        return this.findOne(id, creatorId);
    }

    async deactivate(id: number, creatorId: number): Promise<Test> {
        const test = await this.findOne(id, creatorId);

        if (test.creatorId !== creatorId) {
            throw new ForbiddenException('Нет прав для деактивации этого теста');
        }

        if (test.status !== TestStatus.ACTIVE) {
            throw new ForbiddenException('Можно деактивировать только активные тесты');
        }

        await this.testRepository.update(id, { status: TestStatus.DRAFT });
        return this.findOne(id, creatorId);
    }

    async remove(id: number, creatorId: number): Promise<void> {
        const test = await this.findOne(id, creatorId);

        if (test.creatorId !== creatorId) {
            throw new ForbiddenException('Нет прав для удаления этого теста');
        }

        await this.testRepository.delete(id);
    }

    // Получение активных тестов для учеников
    async findActiveTests(): Promise<Test[]> {
        const tests = await this.testRepository.find({
            where: { status: TestStatus.ACTIVE },
            relations: ['creator', 'questions', 'questions.options'],
            order: { createdAt: 'DESC' },
        });

        // Убираем правильные ответы из всех тестов
        tests.forEach(test => {
            if (test.questions) {
                test.questions.forEach(question => {
                    if (question.options) {
                        question.options.forEach(option => {
                            option.isCorrect = false; // Скрываем информацию о правильности
                        });
                    }
                    question.correctTextAnswer = null;
                });
            }
        });

        return tests;
    }

    // Получение статистики для учителя
    async getTeacherStatistics(creatorId: number) {
        // Проверяем, что пользователь - учитель или преподаватель
        const creator = await this.userRepository.findOne({ where: { id: creatorId } });
        if (!creator || (creator.role !== UserRole.TEACHER && creator.role !== UserRole.PROFESSOR)) {
            throw new ForbiddenException('Только учителя и преподаватели могут получать статистику');
        }

        // Получаем все тесты учителя
        const tests = await this.testRepository.find({
            where: { creatorId },
            relations: ['attempts', 'attempts.user'],
        });

        // Общая статистика по тестам
        const totalTests = tests.length;
        const activeTests = tests.filter(test => test.status === TestStatus.ACTIVE).length;
        const draftTests = tests.filter(test => test.status === TestStatus.DRAFT).length;

        // Получаем все попытки прохождения тестов учителя
        const allAttempts = tests.flatMap(test => test.attempts || []);
        const completedAttempts = allAttempts.filter(attempt => attempt.status === AttemptStatus.COMPLETED);

        // Уникальные ученики
        const uniqueStudents = new Set(allAttempts.map(attempt => attempt.userId));
        const totalStudents = uniqueStudents.size;

        // Средний балл
        const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
        const averageScore = completedAttempts.length > 0 ? Math.round((totalScore / completedAttempts.length) * 100) / 100 : 0;

        // Статистика по каждому тесту
        const testStatistics = tests.map(test => {
            const testAttempts = test.attempts || [];
            const testCompletedAttempts = testAttempts.filter(attempt => attempt.status === AttemptStatus.COMPLETED);
            const testTotalScore = testCompletedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
            const testAverageScore = testCompletedAttempts.length > 0 ? Math.round((testTotalScore / testCompletedAttempts.length) * 100) / 100 : 0;

            return {
                id: test.id,
                title: test.title,
                status: test.status,
                totalAttempts: testAttempts.length,
                completedAttempts: testCompletedAttempts.length,
                averageScore: testAverageScore,
                createdAt: test.createdAt,
            };
        });

        return {
            overview: {
                totalTests,
                activeTests,
                draftTests,
                totalStudents,
                totalAttempts: allAttempts.length,
                completedAttempts: completedAttempts.length,
                averageScore,
            },
            testStatistics: testStatistics.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        };
    }
}