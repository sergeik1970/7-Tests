import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreateTest1758398849713 implements MigrationInterface {
    name = 'AddCreateTest1758398849713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_options" ("id" SERIAL NOT NULL, "text" text NOT NULL, "isCorrect" boolean NOT NULL DEFAULT false, "order" integer NOT NULL, "questionId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum" AS ENUM('multiple_choice', 'text_input')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "text" text NOT NULL, "type" "public"."questions_type_enum" NOT NULL, "order" integer NOT NULL, "correctTextAnswer" text, "testId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "test_answers" ("id" SERIAL NOT NULL, "attemptId" integer NOT NULL, "questionId" integer NOT NULL, "selectedOptionId" integer, "textAnswer" text, "isCorrect" boolean, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da470ae2a8b940780d0cd6211f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."test_attempts_status_enum" AS ENUM('in_progress', 'completed', 'abandoned')`);
        await queryRunner.query(`CREATE TABLE "test_attempts" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "testId" integer NOT NULL, "status" "public"."test_attempts_status_enum" NOT NULL DEFAULT 'in_progress', "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "score" numeric(5,2), "correctAnswers" integer, "totalQuestions" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d40272f8162c607f12e76c0a18e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tests_status_enum" AS ENUM('draft', 'active', 'completed')`);
        await queryRunner.query(`CREATE TABLE "tests" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "description" text, "timeLimit" integer, "status" "public"."tests_status_enum" NOT NULL DEFAULT 'draft', "creatorId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4301ca51edf839623386860aed2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_options" ADD CONSTRAINT "FK_c654af7759a681f1b1addbe35bf" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_94296641072b0f034d14e272cc6" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_answers" ADD CONSTRAINT "FK_6bc1a0f671e47fd7780492444c1" FOREIGN KEY ("attemptId") REFERENCES "test_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_answers" ADD CONSTRAINT "FK_b29188fdf527f05ccb962310310" FOREIGN KEY ("selectedOptionId") REFERENCES "question_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_c2d6de3ee467f1b42f22a30d5a4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_117d71338d1aad502bf5927b1e6" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tests" ADD CONSTRAINT "FK_c78c65b756bcdf99c9361089d9c" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tests" DROP CONSTRAINT "FK_c78c65b756bcdf99c9361089d9c"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_117d71338d1aad502bf5927b1e6"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_c2d6de3ee467f1b42f22a30d5a4"`);
        await queryRunner.query(`ALTER TABLE "test_answers" DROP CONSTRAINT "FK_b29188fdf527f05ccb962310310"`);
        await queryRunner.query(`ALTER TABLE "test_answers" DROP CONSTRAINT "FK_6bc1a0f671e47fd7780492444c1"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_94296641072b0f034d14e272cc6"`);
        await queryRunner.query(`ALTER TABLE "question_options" DROP CONSTRAINT "FK_c654af7759a681f1b1addbe35bf"`);
        await queryRunner.query(`DROP TABLE "tests"`);
        await queryRunner.query(`DROP TYPE "public"."tests_status_enum"`);
        await queryRunner.query(`DROP TABLE "test_attempts"`);
        await queryRunner.query(`DROP TYPE "public"."test_attempts_status_enum"`);
        await queryRunner.query(`DROP TABLE "test_answers"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "question_options"`);
    }

}
