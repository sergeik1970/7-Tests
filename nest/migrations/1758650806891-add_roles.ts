import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoles1758650806891 implements MigrationInterface {
    name = 'AddRoles1758650806891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('pupil', 'teacher', 'student', 'professor')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING 
            CASE 
                WHEN "role"::text = 'participant' THEN 'pupil'::text
                WHEN "role"::text = 'creator' THEN 'teacher'::text
                ELSE 'pupil'::text
            END::"public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'pupil'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('participant', 'creator')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING 
            CASE 
                WHEN "role"::text = 'pupil' THEN 'participant'::text
                WHEN "role"::text = 'teacher' THEN 'creator'::text
                WHEN "role"::text = 'student' THEN 'participant'::text
                WHEN "role"::text = 'professor' THEN 'creator'::text
                ELSE 'participant'::text
            END::"public"."users_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'participant'`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    }

}
