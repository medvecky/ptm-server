import {EntityRepository, MongoRepository} from "typeorm";
import {User} from "./User.entity";
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";
import {ConflictException, InternalServerErrorException} from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
@EntityRepository(User)
export class UserRepository extends MongoRepository<User> {
    private async hashPassword(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        const {username, password} = authCredentialsDto;
        const user = this.create();
        user.salt = await bcrypt.genSalt();
        user.username = username;
        user.password = await this.hashPassword(password, user.salt);
        user.id = uuid();

        try {
            await user.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('username already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const {username, password} = authCredentialsDto;
        const user = await this.findOne({username})

        if (user && await user.validatePassword(password)) {
            return user.username;
        } else {
            return null;
        }
    }
}