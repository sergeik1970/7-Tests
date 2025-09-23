import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Request,
    ParseIntPipe,
} from "@nestjs/common";
import { TestAttemptService } from "../services/test-attempt.service";
import { StartTestDto } from "../dto/test-attempt/start-test.dto";
import { SubmitAnswerDto } from "../dto/test-attempt/submit-answer.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { UserRole } from "../entities/User/user.entity";

@Controller("test-attempts")
@UseGuards(JwtAuthGuard)
export class TestAttemptController {
    constructor(private readonly testAttemptService: TestAttemptService) {}

    // Методы для учеников
    @Post("start")
    startTest(@Body() startTestDto: StartTestDto, @Request() req) {
        return this.testAttemptService.startTest(startTestDto, req.user.id);
    }

    @Post(":attemptId/answer")
    submitAnswer(
        @Param("attemptId", ParseIntPipe) attemptId: number,
        @Body() submitAnswerDto: SubmitAnswerDto,
        @Request() req,
    ) {
        return this.testAttemptService.submitAnswer(attemptId, submitAnswerDto, req.user.id);
    }

    @Post(":attemptId/complete")
    completeTest(@Param("attemptId", ParseIntPipe) attemptId: number, @Request() req) {
        return this.testAttemptService.completeTest(attemptId, req.user.id);
    }

    @Get(":attemptId")
    getAttempt(@Param("attemptId", ParseIntPipe) attemptId: number, @Request() req) {
        return this.testAttemptService.getAttempt(attemptId, req.user.id);
    }

    @Get(":attemptId/time")
    getRemainingTime(@Param("attemptId", ParseIntPipe) attemptId: number, @Request() req) {
        return this.testAttemptService.getAttempt(attemptId, req.user.id);
    }

    @Get()
    getUserAttempts(@Request() req) {
        return this.testAttemptService.getUserAttempts(req.user.id);
    }

    // Методы для учителей
    @Get("test/:testId/attempts")
    @UseGuards(RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.PROFESSOR)
    getTestAttempts(@Param("testId", ParseIntPipe) testId: number, @Request() req) {
        return this.testAttemptService.getTestAttempts(testId, req.user.id);
    }

    @Get("test/:testId/statistics")
    @UseGuards(RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.PROFESSOR)
    getTestStatistics(@Param("testId", ParseIntPipe) testId: number, @Request() req) {
        return this.testAttemptService.getTestStatistics(testId, req.user.id);
    }

    @Get("details/:attemptId")
    @UseGuards(RolesGuard)
    @Roles(UserRole.TEACHER, UserRole.PROFESSOR)
    getAttemptDetails(@Param("attemptId", ParseIntPipe) attemptId: number, @Request() req) {
        return this.testAttemptService.getAttemptDetails(attemptId, req.user.id);
    }
}