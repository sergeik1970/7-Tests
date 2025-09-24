import {
    IsString,
    IsOptional,
    IsInt,
    IsArray,
    ValidateNested,
    IsEnum,
    Min,
} from "class-validator";
import { Type } from "class-transformer";
import { QuestionType } from "../../entities/Question/question.entity";

export class CreateQuestionOptionDto {
    // Текст варианта ответа
    @IsString()
    text: string;

    // Правильный ли вариант ответа
    @IsOptional()
    isCorrect?: boolean;

    // Порядковый номер варианта ответа
    @IsInt()
    @Min(0)
    order: number;
}

export class CreateQuestionDto {
    // Текст вопроса
    @IsString()
    text: string;

    // Тип вопроса из возможных значений QuestionType
    @IsEnum(QuestionType)
    type: QuestionType;

    // Порядковый номер вопроса
    @IsInt()
    @Min(0)
    order: number;

    // Текст правильного варианта ответа
    @IsOptional()
    @IsString()
    correctTextAnswer?: string;

    // Варианты ответов
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionOptionDto)
    options?: CreateQuestionOptionDto[];
}

export class CreateTestDto {
    // Название теста
    @IsString()
    title: string;

    // Описание теста
    @IsOptional()
    @IsString()
    description?: string;

    // Время на прохождение теста
    @IsOptional()
    @IsInt()
    @Min(1)
    timeLimit?: number; // в минутах

    // Вопросы
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}
