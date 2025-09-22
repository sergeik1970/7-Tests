import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ParseIntPipe,
} from "@nestjs/common";
import { TestService } from "../services/test.service";
import { CreateTestDto } from "../dto/test/create-test.dto";
import { UpdateTestDto } from "../dto/test/update-test.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../guards/roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { UserRole } from "../entities/User/user.entity";

@Controller("tests")
@UseGuards(JwtAuthGuard)
export class TestController {
    constructor(private readonly testService: TestService) {}

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    create(@Body() createTestDto: CreateTestDto, @Request() req) {
        return this.testService.create(createTestDto, req.user.id);
    }

    @Get()
    findAll(@Request() req) {
        // Если пользователь - учитель, показываем его тесты
        if (req.user.role === UserRole.CREATOR) {
            return this.testService.findAll(req.user.id);
        }
        // Если ученик - показываем активные тесты
        return this.testService.findActiveTests();
    }

    @Get(":id")
    findOne(@Param("id", ParseIntPipe) id: number, @Request() req) {
        // Если пользователь - учитель, показываем полную информацию
        if (req.user.role === UserRole.CREATOR) {
            return this.testService.findOne(id, req.user.id);
        }
        // Если ученик - показываем без правильных ответов
        return this.testService.findOneForStudent(id);
    }

    @Patch(":id")
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    update(
        @Param("id", ParseIntPipe) id: number,
        @Body() updateTestDto: UpdateTestDto,
        @Request() req,
    ) {
        return this.testService.update(id, updateTestDto, req.user.id);
    }

    @Post(":id/publish")
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    publish(@Param("id", ParseIntPipe) id: number, @Request() req) {
        return this.testService.publish(id, req.user.id);
    }

    @Post(":id/deactivate")
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    deactivate(@Param("id", ParseIntPipe) id: number, @Request() req) {
        return this.testService.deactivate(id, req.user.id);
    }

    @Get("statistics/overview")
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    getStatistics(@Request() req) {
        return this.testService.getTeacherStatistics(req.user.id);
    }

    @Delete(":id")
    @UseGuards(RolesGuard)
    @Roles(UserRole.CREATOR)
    remove(@Param("id", ParseIntPipe) id: number, @Request() req) {
        return this.testService.remove(id, req.user.id);
    }
}
