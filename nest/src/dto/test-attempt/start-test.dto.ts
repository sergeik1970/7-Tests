import { IsNumber } from "class-validator";

export class StartTestDto {
    // Id теста
    @IsNumber()
    testId: number;
}
