import {
    BaseEntity,
    Column,
    Entity,
    ObjectIdColumn,
    OneToMany,
    PrimaryColumn,
    Unique
} from "typeorm";
import * as bcrypt from 'bcrypt';
import {Task} from "../tasks/Task.entity";
import {Project} from "../projects/Project.entity";
import {ApiProperty} from "@nestjs/swagger";

@Entity()
@Unique(['username'])
export class User extends BaseEntity {

    @ObjectIdColumn()
    _id: string;

    @ApiProperty()
    @PrimaryColumn()
    id: string;

    @ApiProperty()
    @Column()
    username: string;

    @ApiProperty()
    @Column()
    password: string;

    @ApiProperty()
    @Column()
    salt: string;

    @OneToMany(type => Task, task => task.user, {eager: true})
    tasks: Task[];

    @OneToMany(type => Project, project => project.user, {eager: true})
    projects: Project[];


    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }

}