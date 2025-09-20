import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../services/UserService/user.service";
import { RegisterDto, LoginDto, AuthResponseDto } from "../dto/auth.dto";
import { User } from "../entities/User/user.entity";
import { JwtPayload } from "./strategies/jwt.strategy";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (
            user &&
            (await this.userService.validatePassword(password, user.password))
        ) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
        // Проверяем совпадение паролей
        if (registerDto.password !== registerDto.confirmPassword) {
            throw new BadRequestException("Пароли не совпадают");
        }

        // Создаем пользователя
        const user = await this.userService.create({
            name: registerDto.name,
            email: registerDto.email,
            password: registerDto.password,
            role: registerDto.role,
        });

        // Генерируем токен
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async login(user: User): Promise<AuthResponseDto> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    async getProfile(userId: number): Promise<Omit<User, "password">> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new UnauthorizedException("Пользователь не найден");
        }

        const { password, ...profile } = user;
        return profile;
    }
}
