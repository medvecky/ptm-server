import {Module} from '@nestjs/common';
import {TasksModule} from './tasks/tasks.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {typeOrmConfig} from "./config/typeorm.config";
import {AuthModule} from './auth/auth.module';
import {ProjectsModule} from './projects/projects.module';
import {LoggingInterceptor} from '@algoan/nestjs-logging-interceptor';
import {APP_INTERCEPTOR} from "@nestjs/core";

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggingInterceptor,
        },
    ],
    imports: [
        TasksModule,
        TypeOrmModule.forRoot(typeOrmConfig),
        AuthModule,
        ProjectsModule
    ],
})
export class AppModule {
}
