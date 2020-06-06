import {Injectable} from '@nestjs/common';
import {Task} from "./task.model";
import {TaskStatus} from "./task.status.enum";
import { v4 as uuid} from 'uuid';
import {CreateTaskDto} from "./create-task.dto";

@Injectable()
export class TasksService {
    private tasks: Task[] = [];

    getAllTasks(): Task[] {
        return this.tasks;
    }

    createTask(createTaskDto: CreateTaskDto): Task {
        const {title, description} = createTaskDto;
        const task: Task = {
            id: uuid(),
            title,
            description,
            status: TaskStatus.OPEN,
        };
        this.tasks.push(task);
        return task;
    }
}
