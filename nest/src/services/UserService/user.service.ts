import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/User/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(userData: {
        name: string;
        email: string;
        password: string;
        role?: UserRole;
    }): Promise<User> {
        // Проверяем, существует ли пользователь с таким email
        const existingUser = await this.userRepository.findOne({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        // Хешируем пароль
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        // Создаем пользователя
        const user = this.userRepository.create({
            ...userData,
            password: hashedPassword,
        });

        return await this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { email }
        });
    }

    async findById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({
            where: { id }
        });
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
        });
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }
        await this.userRepository.remove(user);
    }
}