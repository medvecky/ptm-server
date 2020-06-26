import {TaskStatus} from "../task.status.enum";
import {IsIn, IsNotEmpty, IsOptional} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetTasksFilterDto {
    @IsOptional()
    @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    @ApiProperty({required: false})
    status: TaskStatus;

    @IsOptional()
    @IsNotEmpty()
    @ApiProperty({required: false})
    search: string;
}