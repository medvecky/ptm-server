import {v4 as uuid} from 'uuid';
import {Test} from "@nestjs/testing";
import {ProjectRepository} from "../projects/project.repository";
import {User} from "../auth/User.entity";
import {InternalServerErrorException} from "@nestjs/common";

jest.mock('uuid');
uuid.mockImplementation(() => 'xxx')

const mockUser = new User();
mockUser.username = 'TestUser';
mockUser.id = '1';

describe('ProjectsRepository', () => {
    const mockCreateProjectDto = {title: 'TestTitle', description: 'TestDesc'};

    let projectRepository;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                ProjectRepository
            ]
        }).compile();
        projectRepository = await module.get<ProjectRepository>(ProjectRepository);
    });

    describe('CreateProject', () => {
        let save;
        beforeEach(() => {
            save = jest.fn();
            projectRepository.create = jest.fn().mockReturnValue({
                title: 'TestProject',
                save: save,
            });
        });
        it('should create and save a project', async () => {
            const result = await projectRepository.createProject(mockCreateProjectDto, mockUser);
            delete result.save;
            expect(save).toHaveBeenCalled();
            expect(result).toEqual({
                id: 'xxx',
                title: 'TestTitle',
                description: 'TestDesc',
                userId: '1'
            });
        });
        it("should throw an error as can't save a project", async () => {
            save.mockRejectedValue({error: '333'});
            await expect(projectRepository.createProject(mockCreateProjectDto, mockUser)).rejects.toThrow();
        });
    });

    describe('GetProjects', () => {
        let findMock;

        beforeEach(() => {
            findMock = jest.fn();
            projectRepository.find = findMock;
        });

        it('should to return projects without search', async () => {
            findMock.mockResolvedValue(['project', 'project2']);
            const result = await projectRepository.getProjects(undefined, mockUser);
            expect(findMock).toHaveBeenCalledWith({userId: '1'});
            expect(result).toEqual(['project', 'project2']);
        });

        it('should to return projects with search', async () => {
            findMock.mockResolvedValue(['project', 'project2']);
            const result = await projectRepository.getProjects('xx', mockUser);
            expect(findMock).toHaveBeenCalledWith({
                where: {
                    $and: [
                        {userId: '1'},
                        {
                            $or: [
                                {title: {$regex: `.*xx.*`}},
                                {description: {$regex: `.*xx.*`}},
                            ]
                        }
                    ]
                }
            });
            expect(result).toEqual(['project', 'project2']);
        });

        it(' should to throw InternalServerException as query execution failed', async () => {
            findMock.mockRejectedValue({error: '333'});
            await expect(projectRepository.getProjects('xxx', mockUser)).rejects.toThrow(InternalServerErrorException);

        });

    });

});
