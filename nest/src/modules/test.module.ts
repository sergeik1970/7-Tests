import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from '../services/test.service';
import { TestController } from '../controllers/test.controller';
import { Test } from '../entities/Test/test.entity';
import { Question } from '../entities/Question/question.entity';
import { QuestionOption } from '../entities/QuestionOption/questionOption.entity';
import { User } from '../entities/User/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Test, Question, QuestionOption, User])
    ],
    controllers: [TestController],
    providers: [TestService],
    exports: [TestService],
})
export class TestModule {}