import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix("api");

    // Глобальная валидация
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    if (process.env.NODE_ENV == "dev") {
        app.enableCors({
            origin: ["http://localhost:3000", "http://localhost:3002"],
            credentials: true,
        });
    }
    await app.listen(3001);
}
bootstrap();
