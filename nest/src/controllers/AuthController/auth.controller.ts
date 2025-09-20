import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    ValidationPipe,
    HttpCode,
    HttpStatus,
} from "@nestjs/common";
import { AuthService } from "../../auth/auth.service";
import { LocalAuthGuard } from "../../auth/guards/local-auth.guard";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RegisterDto, LoginDto, AuthResponseDto } from "../../dto/auth.dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("register")
    async register(
        @Body(ValidationPipe) registerDto: RegisterDto,
    ): Promise<AuthResponseDto> {
        return this.authService.register(registerDto);
    }

    @UseGuards(LocalAuthGuard)
    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Request() req): Promise<AuthResponseDto> {
        return this.authService.login(req.user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("profile")
    async getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    async getCurrentUser(@CurrentUser() user: any) {
        return user;
    }
}
