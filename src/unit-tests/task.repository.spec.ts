import {User} from "../auth/User.entity";
import {Test} from "@nestjs/testing";
import {TaskRepository} from "../tasks/task.repository";
import {TaskStatus} from "../tasks/task.status.enum";
import {InternalServerErrorException} from "@nestjs/common";
import {v4 as uuid} from 'uuid';

jest.mock('uuid');
uuid.mockImplementation(() => 'xxx')

const mockUser = new User();
mockUser.username = 'TestUser';
mockUser.id = '1';

describe('TaskRepository', () => {
    const mockCreateTaskDta = {title: 'TestTitle', description: 'TestDesc'};
    let taskRepository;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TaskRepository
            ]
        }).compile();
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });
    describe('createTask', () => {
        let save;
        let uuid;
        beforeEach(() => {
            save = jest.fn();
            taskRepository.create = jest.fn().mockReturnValue({
                title: 'TestTask',
                save: save,
                user: mockUser
            });
            uuid = jest.fn().mockReturnValue('xxx');
        });
        it('creates task, calls task.save() and returns task', async () => {
            const result = await taskRepository.createTask(mockCreateTaskDta, mockUser);
            delete result.save;
            expect(save).toHaveBeenCalled();
            expect(result).toEqual({
                id: 'xxx',
                title: 'TestTitle',
                description: 'TestDesc',
                status: TaskStatus.OPEN,
                userId: '1',
            });
        });
        it('throws InternalServerException as task.save() failed', async () => {
            save.mockRejectedValue({error: '333'});
            await expect(taskRepository.createTask(mockCreateTaskDta, mockUser)).rejects.toThrow();
        });
    });
    describe('getTasks', () => {

        let findMock;

        beforeEach(() => {
            findMock = jest.fn();
            taskRepository.find = findMock;
        });

        it('returns tasks without filters', async () => {
            findMock.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({}, mockUser);
            expect(findMock).toHaveBeenCalledWith({userId: '1'});
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond status criteria', async () => {
            findMock.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({status: TaskStatus.OPEN}, mockUser);
            expect(findMock).toHaveBeenCalledWith({userId: '1', status: 'OPEN'});
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond search criteria', async () => {
            findMock.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({search: 'TestSearch'}, mockUser);
            expect(findMock).toHaveBeenCalledWith(
                {
                    "where":
                        {
                            "$and":
                                [
                                    {"userId": "1"},
                                    {
                                        "$or": [{"title": {"$regex": ".*TestSearch.*"}},
                                            {"description": {"$regex": ".*TestSearch.*"}}]
                                    }]
                        }
                });
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond search and status criteria', async () => {
            findMock.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({status: TaskStatus.OPEN, search: 'TestSearch'}, mockUser);
            expect(findMock).toHaveBeenCalledWith(
                {
                    "where":
                        {
                            "$and":
                                [{"userId": "1"},
                                    {"status": "OPEN"},
                                    {
                                        "$or": [{"title": {"$regex": ".*TestSearch.*"}},
                                            {"description": {"$regex": ".*TestSearch.*"}}]
                                    }]
                        }
                });
            expect(result).toEqual(['task1', 'task2']);
        });
        it('throws InternalServerException as query execution failed', async () => {
            findMock.mockRejectedValue({error: '333'});
            await expect(taskRepository.getTasks({}, mockUser)).rejects.toThrow(InternalServerErrorException);

        });
    });
});