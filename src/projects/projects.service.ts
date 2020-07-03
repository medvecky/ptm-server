import {Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ProjectRepository} from "./project.repository";
import {User} from "../auth/User.entity";
import {CreateProjectDto} from "./dto/create-project.dto";
import {Project} from "./Project.entity";

@Injectable()
export class ProjectsService {
    private logger = new Logger('ProjectService');

    constructor(
        @InjectRepository(ProjectRepository)
        private projectRepository: ProjectRepository) {
    }

    async createProject(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
        return this.projectRepository.createProject(createProjectDto, user);
    }
}
