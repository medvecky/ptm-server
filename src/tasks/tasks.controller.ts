import {
    Body,
    Controller,
    Delete,
    Get, Logger,
    Param,
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
import {
    ApiBadRequestResponse,
    ApiBearerAuth, ApiBody,
    ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import {UpdateTaskDto} from "./dto/update-task.dto";

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
    private logger = new Logger('TasksController');

    constructor(private tasksService: TasksService) {
    }

    @Get()
    @ApiOkResponse({ type: [Task]})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    geTasks(
        @Query(ValidationPipe) filterDto: GetTasksFilterDto,
        @GetUser() user: User): Promise<Task[]> {
        this.logger.verbose(
            `User "${user.username}" retrieving tasks. Filter: ${JSON.stringify(filterDto)}`);
        return this.tasksService.getTasks(filterDto, user);
    }

    @Get('/:id')
    @ApiOkResponse({type: Task})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiNotFoundResponse({description: 'Not found'})
    getTaskById(
        @Param('id') id: string,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.getTaskById(id, user);
    }

    @Post()
    @ApiCreatedResponse({type: Task})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @UsePipes(ValidationPipe)
    createTask(
        @Body() createTaskDto: CreateTaskDto,
        @GetUser() user: User): Promise<Task> {
        this.logger.verbose(
            `User "${user.username}" creating a new tasks. Data: ${JSON.stringify(createTaskDto)}`);
        return this.tasksService.createTask(createTaskDto, user);
    }

    @Delete('/all')
    @ApiOkResponse({description: 'Tasks successfully  deleted'})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    deleteAllTasks(
        @GetUser() user: User): Promise<void> {
        return this.tasksService.deleteAllTasks(user);
    }

    @Delete('/:id')
    @ApiOkResponse({description: 'Task successfully  deleted'})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiNotFoundResponse({description: 'Bad request'})
    deleteTaskById(
        @Param('id') id: string,
        @GetUser() user: User): Promise<void> {
        return this.tasksService.deleteTaskById(id, user);
    }

    @Patch('/:id/status')
    @ApiOkResponse({type: Task})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiNotFoundResponse({description: 'Not found'})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    @ApiBody({
        schema: {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string"
                }

            }
        }
    })
    updateTaskStatus(
        @Param('id') id: string,
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.updateTaskStatus(id, status, user);
    }

    @Patch('/:id')
    @ApiOkResponse({type: Task})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiNotFoundResponse({description: 'Not found'})
    @ApiInternalServerErrorResponse({description: 'Internal server error'})
    updateTask(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @GetUser() user: User): Promise<Task> {
        return this.tasksService.updateTask(id, updateTaskDto, user);
    }
}
