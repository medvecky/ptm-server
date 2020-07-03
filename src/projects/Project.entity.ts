import {BaseEntity, Column, Entity, ManyToOne, ObjectIdColumn, OneToMany, PrimaryColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
import {TaskStatus} from "../tasks/task.status.enum";
import {User} from "../auth/User.entity";
import {Task} from "../tasks/Task.entity";

@Entity()
export class Project extends BaseEntity {

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

    @ManyToOne(type => User, user => user.projects, {eager: false})
    user: User;

    @OneToMany(type => Task, task => task.project, {eager: true})
    tasks: Task[];

    @ApiProperty()
    @Column()
    userId: string;
}