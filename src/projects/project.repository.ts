import {EntityRepository, MongoRepository} from "typeorm";
import {Project} from "./Project.entity";
import {InternalServerErrorException, Logger} from "@nestjs/common";
import {CreateProjectDto} from "./dto/create-project.dto";
import {User} from "../auth/User.entity";
import {v4 as uuid} from 'uuid';

@EntityRepository(Project)
export class ProjectRepository extends MongoRepository<Project> {
    private logger = new Logger('ProjectRepository');

    async createProject(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
        const {title, description} = createProjectDto;
        const project = this.create();
        project.title = title;
        project.description = description;
        project.userId = user.id;
        project.id = uuid();
        try {
            await project.save();
        } catch (error) {
            this.logger.error(
                `Failed to create project for user "${user.username}". DTO: ${JSON.stringify(createProjectDto)}`,
                error.stack);
            throw new InternalServerErrorException();
        }
        delete project._id;
        return project;
    }

    async getProjects(search: string, user: User): Promise<Project[]> {

        let result = [];

        try {
            if (search) {
                result = await this.find({
                    where: {
                        $and: [
                            {userId: user.id},
                            {
                                $or: [
                                    {title: {$regex: `.*${search}.*`}},
                                    {description: {$regex: `.*${search}.*`}},
                                ]
                            }
                        ]
                    }
                });
            } else {
                result = await this.find({userId: user.id});
            }
        } catch (error) {
            throw new InternalServerErrorException();
        }

        result.forEach(project => delete project._id);
        return result
    }
}