import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSingleAnswers1758742108494 implements MigrationInterface {
    name = 'AddSingleAnswers1758742108494'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."questions_type_enum" RENAME TO "questions_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum" AS ENUM('single_choice', 'multiple_choice', 'text_input')`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "type" TYPE "public"."questions_type_enum" USING "type"::"text"::"public"."questions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum_old" AS ENUM('multiple_choice', 'text_input')`);
        await queryRunner.query(`ALTER TABLE "questions" ALTER COLUMN "type" TYPE "public"."questions_type_enum_old" USING "type"::"text"::"public"."questions_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."questions_type_enum_old" RENAME TO "questions_type_enum"`);
    }

}
