import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth, ApiBody,
    ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery,
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

    @Get('/:id')
    @ApiOkResponse({type: Project})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiNotFoundResponse({description: 'Not found'})
    getProjectById(
        @Param('id') id: string,
        @GetUser() user: User): Promise<Project> {
        return this.projectService.getProjectById(id, user);
    }

    @Get()
    @ApiOkResponse({type: [Project]})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiNotFoundResponse({description: 'Not found'})
    @ApiQuery({required: false, name: 'search'})
    getProjects(
        @Query('search') search: string,
        @GetUser() user: User): Promise<Project[]> {
        this.logger.verbose(
            `User "${user.username}" retrieving Projects. Filter: ${JSON.stringify(search)}`);
        return this.projectService.getProjects(search, user);
    }

    @Delete('/all')
    @ApiOkResponse({description: 'Projects successfully  deleted'})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    deleteAllProjects(
        @GetUser() user: User): Promise<void> {
        return this.projectService.deleteAllProjects(user);
    }

    @Delete('/:id')
    @ApiOkResponse({description: 'Project successfully  deleted'})
    @ApiUnauthorizedResponse({description: 'Unauthorized'})
    @ApiBadRequestResponse({description: 'Bad request'})
    @ApiNotFoundResponse({description: 'Bad request'})
    deleteProjectById(
        @Param('id') id: string,
        @GetUser() user: User): Promise<void> {
        return this.projectService.deleteProjectById(id, user);
    }

}
