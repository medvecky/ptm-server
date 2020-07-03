import {v4 as uuid} from 'uuid';
import {Test} from "@nestjs/testing";
import {ProjectRepository} from "../projects/project.repository";
import {User} from "../auth/User.entity";

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

});
