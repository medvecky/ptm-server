import {BaseEntity, Column, Entity, ManyToOne, ObjectIdColumn, PrimaryColumn} from "typeorm";
import {TaskStatus} from "./task.status.enum";
import {User} from "../auth/User.entity";
import {ApiProperty} from "@nestjs/swagger";
import {Project} from "../projects/Project.entity";

@Entity()
export class Task extends BaseEntity {

    @ObjectIdColumn()
    _id: string;

    @ApiProperty()
    @PrimaryColumn()
    id: string;

    @ApiProperty()
    @Column()
    title: string;

    @ApiProperty()
    @Column()
    description: string;

    @ApiProperty()
    @Column()
    status: TaskStatus;

    @ManyToOne(type => User, user => user.tasks, {eager: false})
    user: User;

    @ManyToOne(type => Project, project => project.tasks, {eager: false})
    project: Project;

    @ApiProperty()
    @Column()
    userId: string;

    @ApiProperty()
    @Column()
    projectId: string;

    @ApiProperty()
    @Column()
    beginDate: string;

    @ApiProperty()
    @Column()
    endDate: string;
}