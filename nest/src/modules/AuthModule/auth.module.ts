import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from '../../auth/auth.service';
import { AuthController } from '../../controllers/AuthController/auth.controller';
import { UserService } from '../../services/UserService/user.service';
import { User } from '../../entities/User/user.entity';
import { JwtStrategy } from '../../auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../auth/strategies/local.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
                signOptions: { 
                    expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, UserService, JwtStrategy, LocalStrategy],
    exports: [AuthService, UserService],
})
export class AuthModule {}