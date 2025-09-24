import { IsNumber, IsString, IsOptional, IsArray } from "class-validator";

export class SubmitAnswerDto {
    // Id вопроса
    @IsNumber()
    questionId: number;

    // Id выбранного варианта ответа
    @IsOptional()
    @IsNumber()
    selectedOptionId?: number;

    // Id выбранных вариантов ответа
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    selectedOptionIds?: number[];

    // Ответ текстом
    @IsOptional()
    @IsString()
    textAnswer?: string;
}
