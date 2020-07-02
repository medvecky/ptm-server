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

@Entity()
@Unique(['username'])
export class User extends BaseEntity {

    @ObjectIdColumn()
    _id: string;

    @PrimaryColumn()
    id: string;

    @Column()
    username: string;

    @Column()
    password: string;

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