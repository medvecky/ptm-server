import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {Logger} from "@nestjs/common";
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import * as config from 'config';

async function bootstrap() {
    const logger = new Logger('bootstrap');
    const app = await NestFactory.create(AppModule);
    const serverConfig = config.get('server');
    const port = serverConfig.port;

    const options = new DocumentBuilder()
        .addBearerAuth()
        .setTitle('PTM API')
        .setDescription('PTM API swagger docs')
        .addTag('tasks')
        .addTag('auth')
        .addTag('projects')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    await app.listen(port);
    logger.log(`Application listening on port: ${port}`)
}

bootstrap();
