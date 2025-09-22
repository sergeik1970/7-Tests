import { IsNumber, IsString, IsOptional } from "class-validator";

export class SubmitAnswerDto {
    @IsNumber()
    questionId: number;

    @IsOptional()
    @IsNumber()
    selectedOptionId?: number;

    @IsOptional()
    @IsString()
    textAnswer?: string;
}
