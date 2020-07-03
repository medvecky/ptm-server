import {Body, Controller, Logger, Post, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {GetUser} from "../auth/get-user.decorator";
import {User} from "../auth/User.entity";
import {Project} from "./Project.entity";
import {ProjectsService} from "./projects.service";
import {CreateProjectDto} from "./dto/create-project.dto";

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('projects')
export class ProjectsController {
    private logger = new Logger('ProjectController');

    constructor(private projectService: ProjectsService) {
    }

    @Post()
    @ApiCreatedResponse({type: Project})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @UsePipes(ValidationPipe)
    createProject(
        @Body() createProjectDto: CreateProjectDto,
        @GetUser() user: User): Promise<Project> {
        this.logger.verbose(
            `User "${user.username}" creating a new project. Data: ${JSON.stringify(createProjectDto)}`);
        return this.projectService.createProject(createProjectDto, user);
    }
}
