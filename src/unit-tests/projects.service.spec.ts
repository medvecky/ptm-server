import {Test, TestingModule} from '@nestjs/testing';
import {ProjectsService} from '../projects/projects.service';
import {ProjectRepository} from "../projects/project.repository";
import {User} from "../auth/User.entity";
import {NotFoundException} from "@nestjs/common";

const mockProjectRepository = () => ({
    createProject: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    getProjects: jest.fn()
});

const mockUser = new User();
mockUser.username = 'TestUser';
mockUser.id = '1';

describe('ProjectsService', () => {
    let projectService;
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
        it('should create project and return  result', async () => {
            projectRepository.createProject.mockResolvedValue('someTask');
            const createTaskDto = {title: 'Test task', description: 'Test desc'};
            expect(projectRepository.createProject).not.toHaveBeenCalled();
            const result = await projectService.createProject(createTaskDto, mockUser);
            expect(projectRepository.createProject).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('someTask');
        });
    });

    describe('GetProjectById', () => {
        it('should return a project as the project exists', async () => {
            const mockProject = {title: 'Test title', description: 'Test Desc', _id: 'xxx'};
            const mockResult = {title: 'Test title', description: 'Test Desc'};
            projectRepository.findOne.mockResolvedValue(mockProject);
            const result = await projectService.getProjectById('1', mockUser);
            expect(result).toEqual(mockResult);
            expect(projectRepository.findOne).toHaveBeenCalledWith({id: '1', userId: '1',});
        });

        it('should throw an error as project not exists', () => {
            projectRepository.findOne.mockResolvedValue(null);
            expect(projectService.getProjectById('1', mockUser)).rejects.toThrow(NotFoundException);
            expect(projectService.getProjectById('1', mockUser))
                .rejects
                .toThrowError('Project with id: 1 not found');
        });
    });

    describe('deleteProjectById', () => {
        it('should call ProjectRepository.delete() to delete project', async () => {
            projectService.getProjectById = jest.fn().mockResolvedValue(true);
            expect(projectRepository.delete).not.toHaveBeenCalled();
            await projectService.deleteProjectById('1', mockUser);
            expect(projectRepository.delete).toHaveBeenCalledWith({id: '1', userId: mockUser.id});
            expect(projectService.getProjectById).toHaveBeenCalledWith('1', {"id": "1", "username": "TestUser"});
        });

        it('throws an error as project cold not be found', async () => {
            await expect(projectService.deleteProjectById(1, mockUser)).rejects.toThrow(NotFoundException);
            await expect(projectService.deleteProjectById(1, mockUser))
                .rejects
                .toThrowError('Project with id: 1 not found');
        });
    });

    describe('getProjects', () => {
        it('gets all projects from the repository', async () => {
            projectRepository.getProjects.mockResolvedValue('someValue');

            expect(projectRepository.getProjects).not.toHaveBeenCalled();
            const result = await projectService.getProjects('xx', mockUser);
            expect(projectRepository.getProjects).toHaveBeenCalledWith(
                "xx",
                {"id": "1", "username": "TestUser"});
            expect(result).toEqual('someValue');
        });
    });

    describe('deleteAllProjects', () => {
        it('calls ProjectService.getProjects() and ProjectService.deleteProjectById() as user has projects', async () => {
            projectService.getProjects = jest.fn();
            projectService.deleteProjectById = jest.fn();
            projectService.getProjects.mockResolvedValue([{id: 1}]);
            await expect(projectService.deleteAllProjects(mockUser)).resolves.toBeUndefined();
            expect(projectService.getProjects).toHaveBeenCalledWith(undefined, {id: '1', username: 'TestUser'});
            expect(projectService.deleteProjectById).toHaveBeenCalledWith(1, {id: '1', username: 'TestUser'});
        });
        it('calls ProjectService.getProjects() as user has not projects', async () => {
            projectService.getProjects = jest.fn();
            projectService.deleteProjectById = jest.fn();
            projectService.getProjects.mockResolvedValue([]);
            await expect(projectService.deleteAllProjects(mockUser)).resolves.toBeUndefined();
            expect(projectService.getProjects).toHaveBeenCalledWith(undefined, {id: '1', username: 'TestUser'});
            expect(projectService.deleteProjectById).not.toHaveBeenCalled();
        });
    });



});
