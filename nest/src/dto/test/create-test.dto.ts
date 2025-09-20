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
    @IsString()
    text: string;

    @IsOptional()
    isCorrect?: boolean;

    @IsInt()
    @Min(0)
    order: number;
}

export class CreateQuestionDto {
    @IsString()
    text: string;

    @IsEnum(QuestionType)
    type: QuestionType;

    @IsInt()
    @Min(0)
    order: number;

    @IsOptional()
    @IsString()
    correctTextAnswer?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionOptionDto)
    options?: CreateQuestionOptionDto[];
}

export class CreateTestDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    timeLimit?: number; // в минутах

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions: CreateQuestionDto[];
}
