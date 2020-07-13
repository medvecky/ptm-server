import {ApiProperty} from "@nestjs/swagger";

export class UpdateProjectDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;
}