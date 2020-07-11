import {BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException} from '@nestjs/common';
import {TaskRepository} from "./task.repository";
import {InjectRepository} from "@nestjs/typeorm";
import {Task} from "./Task.entity";
import {CreateTaskDto} from "./dto/create-task.dto";
import {TaskStatus} from "./task.status.enum";
import {GetTasksFilterDto} from "./dto/get-tasks-filter.dto";
import {User} from "../auth/User.entity";
import {UpdateTaskDto} from "./dto/update-task.dto";

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


    async getTaskById(id: string, user: User): Promise<Task> {
        const foundTask = await this.taskRepository.findOne({id: id, userId: user.id});
        if (!foundTask) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        delete foundTask._id;
        return foundTask;
    }

    async getTaskByProjectId(projectId: string, user: User): Promise<Task[]> {
        let foundTasks: Task[];
        try {
            foundTasks = await this.taskRepository.find({projectId: projectId, userId: user.id});
        } catch (e) {
            throw new InternalServerErrorException();
        }

        foundTasks.forEach(task => delete task._id);

        return foundTasks;
    }

    async deleteTaskByProjectId(projectId: string, user: User): Promise<void> {

        const tasks = await this.getTaskByProjectId(projectId, user);

        await tasks.forEach(task => {
            this.deleteTaskById(task.id, user);
        });
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        return this.taskRepository.createTask(createTaskDto, user);
    }

    async deleteTaskById(id: string, user: User): Promise<void> {
        await this.getTaskById(id, user);
        await this.taskRepository.delete({id, userId: user.id});
        this.logger.debug(`User with id: ${user.id} deleted task with id: ${id}`)
    }

    async deleteAllTasks(user: User): Promise<void> {
        const filterDto: GetTasksFilterDto = new GetTasksFilterDto();
        const tasks = await this.getTasks(filterDto, user);
        await tasks.forEach(task => {
            this.deleteTaskById(task.id, user);
        });
    }

    async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {

        const result = await this.taskRepository.findOneAndUpdate(
            {id: id, userId: user.id},
            {$set: {status: status}},
            {returnOriginal: false});

        if(!result.value) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        delete result.value._id;
        return result.value;
    }

    async updateTask(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {

        const {title, description} = updateTaskDto;

        this.logger.verbose(
            `User with id: ${user.id} updates task with id: ${id} by data: ` +
            `${JSON.stringify(updateTaskDto)}`);

        let result;
        if (title && description) {
            result = await this.taskRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {title: title, description: description}},
                {returnOriginal: false});
        } else if (title) {
            result = await this.taskRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {title: title}},
                {returnOriginal: false});
        } else if (description) {
            result = await this.taskRepository.findOneAndUpdate(
                {id: id, userId: user.id},
                {$set: {description: description}},
                {returnOriginal: false});
        } else {
            throw new BadRequestException('Empty title and description');
        }

        if (!result.value) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        delete result.value._id;
        return result.value;
    }

    async addProjectToTask(id: string, projectId: string, user: User): Promise<Task> {

        this.logger.verbose(
            `User with id: ${user.id}  puts projectId: ${projectId} to task: ${id}`);

        if(!projectId) {
            throw new BadRequestException('Bad projectId');
        }

        const result = await this.taskRepository.findOneAndUpdate(
            {id: id, userId: user.id},
            {$set: {projectId: projectId}},
            {returnOriginal: false});

        if(!result.value) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        delete result.value._id;
        return result.value;
    }

    async deleteProjectFromTask(id: string,  user: User): Promise<Task> {
        this.logger.verbose(
            `User with id: ${user.id} removes projectId from task: ${id}`);

        const result = await this.taskRepository.findOneAndUpdate(
            {id: id, userId: user.id},
            {$unset: {projectId: ''}},
            {returnOriginal: false});

        if(!result.value) {
            throw new NotFoundException(`Task with id: ${id} not found`);
        }

        delete result.value._id;
        return result.value;
    }
}
