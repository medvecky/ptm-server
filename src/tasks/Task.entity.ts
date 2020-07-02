import {BaseEntity, Column, Entity, ManyToOne, ObjectIdColumn, PrimaryColumn} from "typeorm";
import {TaskStatus} from "./task.status.enum";
import {User} from "../auth/User.entity";
import {ApiProperty} from "@nestjs/swagger";
import {Project} from "../projects/Project.entity";

@Entity()
export class Task extends BaseEntity {

    @ObjectIdColumn()
    _id: string;

    @PrimaryColumn()
    @ApiProperty()
    id: string;

    @Column()
    @ApiProperty()
    title: string;

    @Column()
    @ApiProperty()
    description: string;

    @Column()
    @ApiProperty()
    status: TaskStatus;

    @ManyToOne(type => User, user => user.tasks, {eager: false})
    user: User;

    @ManyToOne(type => Project, project => project.tasks, {eager: false})
    project: Project;

    @Column()
    @ApiProperty()
    userId: string;

    @Column()
    @ApiProperty()
    projectId: string;
}