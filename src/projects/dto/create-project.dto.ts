import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty} from "class-validator";

export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    description: string;
}