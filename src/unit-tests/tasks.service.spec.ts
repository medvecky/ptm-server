import {Test} from "@nestjs/testing";
import {TasksService} from "../tasks/tasks.service";
import {TaskRepository} from "../tasks/task.repository";
import {GetTasksFilterDto} from "../tasks/dto/get-tasks-filter.dto";
import {TaskStatus} from "../tasks/task.status.enum";
import {BadRequestException, NotFoundException} from "@nestjs/common";

const mockTaskRepository = () => ({
    getTasks: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    createTask: jest.fn(),
    delete: jest.fn()
});

const mockUser = {username: 'TestUser', id: '1'};

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
            expect(taskRepository.getTasks).toHaveBeenCalledWith({
                    "search": "Some search query",
                    "status": "IN_PROGRESS",
                },
                {"id": "1", "username": "TestUser"});
            expect(result).toEqual('someValue');
        });
    });

    describe('getTaskById', () => {
        it('calls repository.findOne() and successful retrieve and return the task', async () => {
            const mockTask = {title: 'Test title', description: 'Test Desc'};
            taskRepository.findOne.mockResolvedValue(mockTask);
            const result = await taskService.getTaskById('1', mockUser);
            expect(result).toEqual(mockTask);
            expect(taskRepository.findOne).toHaveBeenCalledWith({id: '1', userId: '1',});
        });

        it('throws an error as task is not found', () => {
            taskRepository.findOne.mockResolvedValue(null);
            expect(taskService.getTaskById('1', mockUser)).rejects.toThrow(NotFoundException);
            expect(taskService.getTaskById('1', mockUser))
                .rejects
                .toThrow('Task with id: 1 not found');
        });
    });

    describe('createTask', () => {
        it('calls taskRepository.createTask() and returns the result', async () => {

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
            taskService.getTaskById = jest.fn().mockResolvedValue(true);
            expect(taskRepository.delete).not.toHaveBeenCalled();
            await taskService.deleteTaskById(1, mockUser);
            expect(taskRepository.delete).toHaveBeenCalledWith({id: 1, userId: mockUser.id});
            expect(taskService.getTaskById).toHaveBeenCalledWith(1, {"id": "1", "username": "TestUser"});
        });

        it('throws an error as task cold not be found', async () => {
            await expect(taskService.deleteTaskById(1, mockUser)).rejects.toThrow(NotFoundException);
            await expect(taskService.deleteTaskById(1, mockUser))
                .rejects
                .toThrowError('Task with id: 1 not found');
        });
    });

    describe('updateTaskStatus', () => {
        it('updates task status', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: {status: 'DONE'}})
            const result = await taskService.updateTaskStatus('1', TaskStatus.DONE, mockUser);
            expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                    id: '1',
                    userId: '1',
                },
                {$set: {status: 'DONE'}},
                {returnOriginal: false});
            expect(result.status).toEqual(TaskStatus.DONE);
        });
        it('throws error when task not found', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: undefined})
            await expect(taskService.updateTaskStatus('1', TaskStatus.DONE, mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(taskService.updateTaskStatus('1', TaskStatus.DONE, mockUser))
                .rejects
                .toThrowError('Task with id: 1 not found');
        });
    });

    describe('deleteAllTasks', () => {
        it('calls TasksService.getTasks() and TasksService.deleteTaskById() as user has tasks', async () => {
            taskService.getTasks = jest.fn();
            taskService.deleteTaskById = jest.fn();
            taskService.getTasks.mockResolvedValue([{id: 1}]);
            await expect(taskService.deleteAllTasks(mockUser)).resolves.toBeUndefined();
            expect(taskService.getTasks).toHaveBeenCalledWith({}, {id: '1', username: 'TestUser'});
            expect(taskService.deleteTaskById).toHaveBeenCalledWith(1, {id: '1', username: 'TestUser'});
        });
        it('calls TasksService.getTasks() as user has not tasks', async () => {
            taskService.getTasks = jest.fn();
            taskService.deleteTaskById = jest.fn();
            taskService.getTasks.mockResolvedValue([]);
            await expect(taskService.deleteAllTasks(mockUser)).resolves.toBeUndefined();
            expect(taskService.getTasks).toHaveBeenCalledWith({}, {id: '1', username: 'TestUser'});
            expect(taskService.deleteTaskById).not.toHaveBeenCalled();
        });
    });
    describe('updateTask', () => {
        it('should properly call taskRepository.findOneAndUpdate() as title and and description was passed',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({value: 'xx'});
                await expect(taskService.updateTask('1', {title: 'x', description: 'x'}, mockUser))
                    .resolves
                    .toBeDefined();
                expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                        id: '1',
                        userId: '1',
                    },
                    {$set: {description: 'x', title: 'x'}},
                    {returnOriginal: false}
                );
            });

        it('should properly call taskRepository.findOneAndUpdate() as description is empty',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({value: 'xx'});
                await expect(taskService.updateTask('1', {title: 'x', description: ''}, mockUser))
                    .resolves
                    .toBeDefined();
                expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                        id: '1',
                        userId: '1',
                    },
                    {$set: {title: 'x'}},
                    {returnOriginal: false}
                );
            });

        it('should properly call taskRepository.findOneAndUpdate() as description not passed',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({value: 'xx'});
                await expect(taskService.updateTask('1', {title: 'x'}, mockUser))
                    .resolves
                    .toBeDefined();
                expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                        id: '1',
                        userId: '1',
                    },
                    {$set: {title: 'x'}},
                    {returnOriginal: false}
                );
            });

        it('should properly call taskRepository.findOneAndUpdate() as title is empty',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({value: 'xx'});
                await expect(taskService.updateTask('1', {title: '', description: 'x'}, mockUser))
                    .resolves
                    .toBeDefined();
                expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                        id: '1',
                        userId: '1',
                    },
                    {$set: {description: 'x'}},
                    {returnOriginal: false}
                );
            });

        it('should properly call taskRepository.findOneAndUpdate() as title not passed',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({value: 'xx'});
                await expect(taskService.updateTask('1', {description: 'x'}, mockUser))
                    .resolves
                    .toBeDefined();
                expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                        id: '1',
                        userId: '1',
                    },
                    {$set: {description: 'x'}},
                    {returnOriginal: false}
                );
            });

        it('should throw error as title and description are empty',
            async () => {
                await expect(taskService.updateTask('1', {title: '', description: ''}, mockUser))
                    .rejects
                    .toThrow(BadRequestException);
                await expect(taskService.updateTask('1', {title: '', description: ''}, mockUser))
                    .rejects
                    .toThrowError('Empty title and description');
                expect(taskRepository.findOneAndUpdate).not.toHaveBeenCalledWith();
            });

        it('should throw error as title and description are not been passed',
            async () => {
                await expect(taskService.updateTask('1', {}, mockUser))
                    .rejects
                    .toThrow(BadRequestException);
                await expect(taskService.updateTask('1', {}, mockUser))
                    .rejects
                    .toThrowError('Empty title and description');
                expect(taskRepository.findOneAndUpdate).not.toHaveBeenCalledWith();
            });

        it('should throw error as given id not exists',
            async () => {
                taskRepository.findOneAndUpdate.mockResolvedValue({x: 'y'});
                await expect(taskService.updateTask('1', {title: 'x', description: 'x'}, mockUser))
                    .rejects
                    .toThrow(NotFoundException);
                await expect(taskService.updateTask('1', {title: 'x', description: 'x'}, mockUser))
                    .rejects
                    .toThrowError('Task with id: 1 not found');
            });
    });

    describe('addProjectToTask', () => {
        it('should add project to task', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: {projectId: 'xxx'}})
            const result = await taskService.addProjectToTask('1', 'xxx', mockUser);
            expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                    id: '1',
                    userId: '1',
                },
                {$set: {projectId: 'xxx'}},
                {returnOriginal: false});
            expect(result.projectId).toEqual('xxx');
        });
        it('throws error when task not found', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: undefined})
            await expect(taskService.addProjectToTask('1', 'xxx', mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(taskService.addProjectToTask('1', 'xxx', mockUser))
                .rejects
                .toThrowError('Task with id: 1 not found');
        });

        it('throws error as projectId is empty', async () => {
            await expect(taskService.addProjectToTask('1', '', mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(taskService.addProjectToTask('1', '', mockUser))
                .rejects
                .toThrowError('Bad projectId');
        });

        it('throws error as projectId not defined', async () => {
            await expect(taskService.addProjectToTask('1', undefined, mockUser))
                .rejects
                .toThrow(BadRequestException);
            await expect(taskService.addProjectToTask('1', undefined, mockUser))
                .rejects
                .toThrowError('Bad projectId');
        });
    });

    describe('deleteProjectFromTask', () => {
        it('should add project to task', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: {id: 'xxx'}})
            await taskService.deleteProjectFromTask('1', mockUser);
            expect(taskRepository.findOneAndUpdate).toHaveBeenCalledWith({
                    id: '1',
                    userId: '1',
                },
                {$unset: {projectId: ''}},
                {returnOriginal: false});
        });
        it('throws error when task not found', async () => {
            taskRepository.findOneAndUpdate.mockResolvedValue({value: undefined})
            await expect(taskService.deleteProjectFromTask('1', mockUser))
                .rejects
                .toThrow(NotFoundException);
            await expect(taskService.deleteProjectFromTask('1', mockUser))
                .rejects
                .toThrowError('Task with id: 1 not found');
        });
    });
});