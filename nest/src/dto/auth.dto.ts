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
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(6)
    confirmPassword: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole = UserRole.PUPIL;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class AuthResponseDto {
    access_token: string;
    user: {
        id: number;
        email: string;
        name: string;
        role: UserRole;
    };
}
