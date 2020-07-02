import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ProjectRepository} from "./project.repository";

@Injectable()
export class ProjectsService {
    private logger = new Logger('ProjectService');

    constructor(
        @InjectRepository(ProjectRepository)
        private projectRepository: ProjectRepository) {
    }
}
