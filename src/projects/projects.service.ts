import {BadRequestException, Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {ProjectRepository} from "./project.repository";
import {User} from "../auth/User.entity";
import {CreateProjectDto} from "./dto/create-project.dto";
import {Project} from "./Project.entity";
import {UpdateProjectDto} from "./dto/update-project.dto";

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

    async getProjectById(id: string, user: User): Promise<Project> {
        const foundProject = await this.projectRepository.findOne({id: id, userId: user.id});
        if (!foundProject) {
            throw new NotFoundException(`Project with id: ${id} not found`);
        }

        delete foundProject._id;
        return foundProject;
    }

    async deleteProjectById(id: string, user: User): Promise<void> {
        await this.getProjectById(id, user);
        await this.projectRepository.delete({id, userId: user.id});
        this.logger.debug(`User with id: ${user.id} deleted project with id: ${id}`)
    }

    async getProjects(search: string, user: User): Promise<Project[]> {
        return this.projectRepository.getProjects(search, user);
    }

    async deleteAllProjects(user: User): Promise<void> {
        const projects = await this.getProjects(undefined, user);
        await projects.forEach(project => {
            this.deleteProjectById(project.id, user);
        });
    }

    async updateProject(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {

        const {title, description} = updateProjectDto;

        this.logger.verbose(
            `User with id: ${user.id} updates project with id: ${id} by data: ` +
            `${JSON.stringify(updateProjectDto)}`);

        let result;
        if (title && description) {
            result = await this.projectRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {title: title, description: description}},
                {returnOriginal: false});
        } else if (title) {
            result = await this.projectRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {title: title}},
                {returnOriginal: false});
        } else if (description) {
            result = await this.projectRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {description: description}},
                {returnOriginal: false});
        } else {
            throw new BadRequestException('Empty title and description');
        }

        if (!result.value) {
            throw new NotFoundException(`Project with id: ${id} not found`);
        }

        delete result.value._id;
        return result.value;
    }
}
