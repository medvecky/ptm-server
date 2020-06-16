import {Test} from "@nestjs/testing";
import {TasksService} from "../tasks/tasks.service";
import {TaskRepository} from "../tasks/task.repository";
import {GetTasksFilterDto} from "../tasks/dto/get-tasks-filter.dto";
import {TaskStatus} from "../tasks/task.status.enum";
import {NotFoundException} from "@nestjs/common";

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn()
});

const mockUser = {username: 'TestUser', id: 1};

describe('Task Service', () => {
    let taskService;
    let taskRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                TasksService,
                {provide: TaskRepository, useFactory: mockTaskRepository}
            ]
        }).compile();
        taskService = await module.get<TasksService>(TasksService);
        taskRepository = await module.get<TaskRepository>(TaskRepository);
    });

    describe('getTasks', () => {
        it('gets all tasks from the repository', async () => {
            taskRepository.getTasks.mockResolvedValue('someValue');

            expect(taskRepository.getTasks).not.toHaveBeenCalled();
            const filters: GetTasksFilterDto = {
                status: TaskStatus.IN_PROGRESS,
                search: 'Some search query'
            };
            const result = await taskService.getTasks(filters, mockUser);
            expect(taskRepository.getTasks).toHaveBeenCalled();
            expect(result).toEqual('someValue');
        });
    });

    describe('getTaskById', () => {
        it('calls repository.findOne() and successful retrieve and return the task', async () => {
            const mockTask = {title: 'Test title', description: 'Test Desc'};
            taskRepository.findOne.mockResolvedValue(mockTask);
            const result = await taskService.getTaskById(1, mockUser);
            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({where: {id: 1, userId: mockUser.id}});
        });

        it('throws an error as task is not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(taskService.getTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
        });
    });

    describe('createTask', () => {
        it('calls taskRepository.createTask() and returns the reslt', async () => {

            taskRepository.createTask.mockResolvedValue('someTask');

            const createTaskDto = {title: 'Test task', description: 'Test desc'};
            expect(taskRepository.createTask).not.toHaveBeenCalled();
            const result = await taskService.createTask(createTaskDto, mockUser);
            expect(taskRepository.createTask).toHaveBeenCalledWith(createTaskDto, mockUser);
            expect(result).toEqual('someTask');
        });
    });

    describe('deleteTaskById', () => {
        it('calls taskRepository.delete() to delete task', async () => {
            taskRepository.delete.mockResolvedValue({affected: 1});
            expect(taskRepository.delete).not.toHaveBeenCalled();
            await taskService.deleteTaskById(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({id: 1, userId: mockUser.id});
        });

        it('throws an error as task cold not be found', async () => {
            taskRepository.delete.mockResolvedValue({affected: 0});
            await expect(taskService.deleteTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
            await expect(taskService.deleteTaskById(1, mockUser)).rejects.toThrowError('Task with id: 1 not found');
        });
    });

    describe('updateTaskStatus', () => {
        it('updates task status', async () => {
            const save = jest.fn().mockResolvedValue(true);
            taskService.getTaskById = jest.fn().mockResolvedValue({
                status: TaskStatus.OPEN,
                save
            });

            expect(taskService.getTaskById).not.toHaveBeenCalled();
            expect(save).not.toHaveBeenCalled();
            const result = await taskService.updateTaskStatus(1, TaskStatus.DONE, mockUser);
            expect(taskService.getTaskById).toHaveBeenCalledWith(1, mockUser);
            expect(save).toHaveBeenCalled();
            expect(result.status).toEqual(TaskStatus.DONE);
        });
    });

    describe('deleteAllTasks', () => {
        it('calls TasksService.getTasks() and TasksService.deleteTaskById() as user has tasks', async () => {
            taskService.getTasks = jest.fn();
            taskService.deleteTaskById = jest.fn();
            taskService.getTasks.mockResolvedValue([{id: 1}]);
            await expect(taskService.deleteAllTasks(mockUser)).resolves.toBeUndefined();
            expect(taskService.getTasks).toHaveBeenCalledWith({}, {id: 1, username: 'TestUser'});
            expect(taskService.deleteTaskById).toHaveBeenCalledWith(1, {id: 1, username: 'TestUser'});
        });
        it('calls TasksService.getTasks() as user has not tasks', async () => {
            taskService.getTasks = jest.fn();
            taskService.deleteTaskById = jest.fn();
            taskService.getTasks.mockResolvedValue([]);
            await expect(taskService.deleteAllTasks(mockUser)).resolves.toBeUndefined();
            expect(taskService.getTasks).toHaveBeenCalledWith({}, {id: 1, username: 'TestUser'});
            expect(taskService.deleteTaskById).not.toHaveBeenCalled();
        });
    });
});