import {TaskStatus} from "../task.status.enum";
import {IsIn, IsNotEmpty, IsOptional} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class GetTasksFilterDto {
    @ApiProperty({required: false})
    @IsOptional()
    @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    status: TaskStatus;

    @ApiProperty({required: false})
    @IsOptional()
    @IsNotEmpty()
    search: string;
}