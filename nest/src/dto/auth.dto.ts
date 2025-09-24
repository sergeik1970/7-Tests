import {
    IsEmail,
    IsString,
    MinLength,
    IsEnum,
    IsOptional,
} from "class-validator";
import { UserRole } from "../entities/User/user.entity";

export class RegisterDto {
    @IsString()
    @MinLength(2)
    // Имя
    name: string;

    // Эл почта является ли таковой
    @IsEmail()
    email: string;

    // Пароль
    @IsString()
    @MinLength(6)
    password: string;

    // Подтверждение пароля
    @IsString()
    @MinLength(6)
    confirmPassword: string;

    // Роль
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.PUPIL;
}

export class LoginDto {
    // Эл почта
    @IsEmail()
    email: string;

    // Пароль
    @IsString()
    password: string;
}

export class AuthResponseDto {
    // Токен
    access_token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
    };
}
