import { IsNumber } from "class-validator";

export class CompleteTestDto {
    // Id попытки
    @IsNumber()
    attemptId: number;
}
