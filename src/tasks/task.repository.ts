import {EntityRepository, MongoRepository} from "typeorm";
import {Task} from "./Task.entity";
import {CreateTaskDto} from "./dto/create-task.dto";
import {TaskStatus} from "./task.status.enum";
import {GetTasksFilterDto} from "./dto/get-tasks-filter.dto";
import {User} from "../auth/User.entity";
import {InternalServerErrorException, Logger} from "@nestjs/common";
import {v4 as uuid} from 'uuid';

@EntityRepository(Task)
export class TaskRepository extends MongoRepository<Task> {

    private logger = new Logger('TaskRepository');

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const {title, description} = createTaskDto;
        const task = this.create();
        task.title = title;
        task.description = description;
        task.status = TaskStatus.OPEN;
        task.userId = user.id;
        task.id = uuid();
        try {
            await task.save();
        } catch (error) {
            this.logger.error(
                `Failed to create tasks for user "${user.username}". DTO: ${JSON.stringify(createTaskDto)}`,
                error.stack);
            throw new InternalServerErrorException();
        }
        delete task.user;
        delete task._id;
        return task;
    }

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        const {status, search} = filterDto;

        let result = [];
        
        try {
            if (!status && !search) {
                result = await this.find({userId: user.id});
            } else if (status && !search) {
                result = await this.find({userId: user.id, status: status});
            } else if (!status && search) {
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
                result = await this.find({
                    where: {
                        $and: [
                            {userId: user.id},
                            {status: status},
                            {
                                $or: [
                                    {title: {$regex: `.*${search}.*`}},
                                    {description: {$regex: `.*${search}.*`}},
                                ]
                            }
                        ]
                    }
                });
            }
        }
        catch (error) {
            throw new InternalServerErrorException();
        }

        result.forEach(task => delete task._id);
        return result
    }
}