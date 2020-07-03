import {Test, TestingModule} from '@nestjs/testing';
import {ProjectsService} from '../projects/projects.service';
import {ProjectRepository} from "../projects/project.repository";
import {User} from "../auth/User.entity";

const mockProjectRepository = () => ({
    createProject: jest.fn()
});

const mockUser = new User();
mockUser.username = 'TestUser';
mockUser.id = '1';

describe('ProjectsService', () => {
    let projectService: ProjectsService;
    let projectRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                {provide: ProjectRepository, useFactory: mockProjectRepository}
            ],
        }).compile();

        projectService = await module.get<ProjectsService>(ProjectsService);
        projectRepository = await module.get<ProjectRepository>(ProjectRepository);
    });

    it('should be defined', () => {
        expect(projectService).toBeDefined();
    });

    describe('CreteProject', () => {
        it('should create task and return  result', async  () => {
            projectRepository.createProject.mockResolvedValue('someTask');
            const createTaskDto = {title: 'Test task', description: 'Test desc'};
            expect(projectRepository.createProject).not.toHaveBeenCalled();
            const result = await projectService.createProject(createTaskDto, mockUser);
            expect(projectRepository.createProject).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('someTask');
        });
    });
});
