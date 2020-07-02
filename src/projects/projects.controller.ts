import {Controller, Logger, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(AuthGuard())
@Controller('projects')
export class ProjectsController {
    private logger = new Logger('ProjectController');
}
