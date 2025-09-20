import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DealsModule } from "./modules/DealsModule/deal.module";
import { AuthModule } from "./modules/AuthModule/auth.module";
import { TestModule } from "./modules/test.module";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.NODE_ENV == "dev" ? "127.0.0.1" : "db",
            port: 5432,
            username: "postgres",
            password: "postgres",
            database: "postgres",
            autoLoadEntities: true,
            synchronize: false,
        }),
        DealsModule,
        AuthModule,
        TestModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
