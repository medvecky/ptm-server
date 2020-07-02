import {EntityRepository, MongoRepository} from "typeorm";
import {Project} from "./Project.entity";
import {Logger} from "@nestjs/common";

@EntityRepository(Project)
export class ProjectRepository extends MongoRepository<Project> {
    private logger = new Logger('ProjectRepository');
}