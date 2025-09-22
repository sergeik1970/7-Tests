import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from '../services/test.service';
import { TestAttemptService } from '../services/test-attempt.service';
import { TestController } from '../controllers/test.controller';
import { TestAttemptController } from '../controllers/test-attempt.controller';
import { Test } from '../entities/Test/test.entity';
import { Question } from '../entities/Question/question.entity';
import { QuestionOption } from '../entities/QuestionOption/questionOption.entity';
import { TestAttempt } from '../entities/TestAttempt/testAttempt.entity';
import { TestAnswer } from '../entities/TestAnswer/testAnswer.entity';
import { User } from '../entities/User/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Test, 
            Question, 
            QuestionOption, 
            TestAttempt, 
            TestAnswer, 
            User
        ])
    ],
    controllers: [TestController, TestAttemptController],
    providers: [TestService, TestAttemptService],
    exports: [TestService, TestAttemptService],
})
export class TestModule {}