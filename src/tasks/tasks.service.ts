import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {TaskRepository} from "./task.repository";
import {InjectRepository} from "@nestjs/typeorm";
import {Task} from "./Task.entity";
import {CreateTaskDto} from "./dto/create-task.dto";
import {TaskStatus} from "./task.status.enum";
import {GetTasksFilterDto} from "./dto/get-tasks-filter.dto";
import {User} from "../auth/User.entity";

@Injectable()
export class TasksService {

    private logger = new Logger('TasksService');

    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository) {
    }

    async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
        return this.taskRepository.getTasks(filterDto, user);
    }


    async getTaskById(id: number, user: User): Promise<Task> {
        const foundTask = await this.taskRepository.findOne({where: {id, userId: user.id}});
        if (!foundTask) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        return foundTask;
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }

    async deleteTaskById(id: number, user: User): Promise<void> {
        const result = await this.taskRepository.delete({id, userId: user.id});
        this.logger.log(`User with id: ${user.id} deleted task with id: ${id}`)
        if (result.affected === 0) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

    }

    async deleteAllTasks(user: User): Promise<void> {
        const filterDto: GetTasksFilterDto = new GetTasksFilterDto();
        const tasks = await this.getTasks(filterDto, user);
        await tasks.forEach(task => {
            this.deleteTaskById(task.id, user);
        });
    }

    async updateTaskStatus(id: number, status: TaskStatus, user: User): Promise<Task> {
        const task = await this.getTaskById(id, user);
        task.status = status;
        await task.save();
        return task;
    }

}
