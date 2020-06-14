import {User} from "../auth/User.entity";
import {Test} from "@nestjs/testing";
import {TaskRepository} from "../tasks/task.repository";
import {TaskStatus} from "../tasks/task.status.enum";
import {InternalServerErrorException} from "@nestjs/common";

const mockUser = new User();
mockUser.username = 'TestUser';
mockUser.id = 1;

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
        beforeEach(() => {
            save = jest.fn();
            taskRepository.create = jest.fn().mockReturnValue({
                title: 'TestTask',
                save: save,
                user: mockUser
            });
        });
        it('creates task, calls task.save() and returns task', async () => {
            const result = await taskRepository.createTask(mockCreateTaskDta, mockUser);
            delete result.save;
            expect(save).toHaveBeenCalled();
            expect(result).toEqual({
                title: 'TestTitle',
                description: 'TestDesc',
                status: TaskStatus.OPEN
            });
        });
        it('throws InternalServerException as task.save() failed', async () => {
            save.mockRejectedValue({error: '333'});
            await expect(taskRepository.createTask(mockCreateTaskDta, mockUser)).rejects.toThrow();
        });
    });
    describe('getTasks', () => {
        let where;
        let andWhere;
        let getMany;
        beforeEach(() => {
            where = jest.fn();
            andWhere = jest.fn();
            getMany = jest.fn();

            taskRepository.createQueryBuilder = jest.fn().mockReturnValue({
                where,
                andWhere,
                getMany
            });
        });

        it('returns tasks without filters', async () => {
            getMany.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({}, mockUser);
            expect(where).toHaveBeenCalledWith("task.userId = :userId", {userId: 1});
            expect(andWhere).not.toHaveBeenCalled();
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond status criteria', async () => {
            getMany.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({status: TaskStatus.OPEN}, mockUser);
            expect(where).toHaveBeenCalledWith("task.userId = :userId", {userId: 1});
            expect(andWhere).toHaveBeenCalledTimes(1);
            expect(andWhere).toHaveBeenCalledWith("task.status = :status", {status: TaskStatus.OPEN});
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond search criteria', async () => {
            getMany.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({search: 'TestSearch'}, mockUser);
            expect(where).toHaveBeenCalledWith("task.userId = :userId", {userId: 1});
            expect(andWhere).toHaveBeenCalledTimes(1);
            expect(andWhere).toHaveBeenCalledWith("(task.title LIKE :search OR task.description LIKE :search)",
                {search: '%TestSearch%'});
            expect(result).toEqual(['task1', 'task2']);
        });
        it('returns tasks correspond search and status criteria', async () => {
            getMany.mockResolvedValue(['task1', 'task2']);
            const result = await taskRepository.getTasks({status: TaskStatus.OPEN, search: 'TestSearch'}, mockUser);
            expect(where).toHaveBeenCalledWith("task.userId = :userId", {userId: 1});
            expect(andWhere).toHaveBeenCalledTimes(2);
            expect(andWhere).toHaveBeenNthCalledWith(
                1,
                'task.status = :status',
                {status: TaskStatus.OPEN});
            expect(andWhere).toHaveBeenNthCalledWith(
                2,
                "(task.title LIKE :search OR task.description LIKE :search)",
                {search: '%TestSearch%'});
            expect(result).toEqual(['task1', 'task2']);
        });
        it('throws InternalServerException as query execution failed', async () => {
            getMany.mockRejectedValue({error: '333'});
            await expect(taskRepository.getTasks({}, mockUser)).rejects.toThrow(InternalServerErrorException);

        });
    });
});