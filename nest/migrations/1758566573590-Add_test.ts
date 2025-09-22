import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTest1758566573590 implements MigrationInterface {
    name = "AddTest1758566573590";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_answers" ADD CONSTRAINT "FK_f0ae0118e4b142f5bfc8b352009" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "test_answers" DROP CONSTRAINT "FK_f0ae0118e4b142f5bfc8b352009"`,
        );
    }
}
