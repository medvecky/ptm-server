import {
    Body,
    Controller,
    Delete,
    Get, Logger,
    Param,
    ParseIntPipe,
    Patch,
    Post, Query, UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {TasksService} from "./tasks.service";
import {Task} from "./Task.entity";
import {CreateTaskDto} from "./dto/create-task.dto";
import {TaskStatusValidationPipe} from "./pipes/task-status-validation.pipe";
import {TaskStatus} from "./task.status.enum";
import {GetTasksFilterDto} from "./dto/get-tasks-filter.dto";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../auth/get-user.decorator";
import {User} from "../auth/User.entity";

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');

    constructor(private tasksService: TasksService) {
    }

    @Get()
    geTasks(
        @Query(ValidationPipe) filterDto: GetTasksFilterDto,
        @GetUser() user: User): Promise<Task[]> {
        this.logger.verbose(
            `User "${user.username}" retrieving tasks. Filter: ${JSON.stringify(filterDto)}`);
        return this.tasksService.getTask(filterDto, user);
    }

    @Get('/:id')
    getTaskById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.getTaskById(id, user);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User): Promise<Task> {
        this.logger.verbose(
            `User "${user.username}" creating a new tasks. Data: ${JSON.stringify(createTaskDto)}`);
        return this.tasksService.createTask(createTaskDto, user);
    }

    @Delete('/:id')
    deleteTaskById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User): Promise<void> {
        return this.tasksService.deleteTaskById(id, user);
    }

    @Patch('/:id/status')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.updateTaskStatus(id, status, user);
    }
}
