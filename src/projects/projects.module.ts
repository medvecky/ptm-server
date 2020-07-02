import {Module} from '@nestjs/common';
import {ProjectsController} from './projects.controller';
import {ProjectsService} from './projects.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ProjectRepository} from "./project.repository";
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([ProjectRepository]),
        AuthModule
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService]
})
export class ProjectsModule {
}
