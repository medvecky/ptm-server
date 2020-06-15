import {Injectable, Logger, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {UserRepository} from "./user.repository";
import {InjectRepository} from "@nestjs/typeorm";
import {AuthCredentialsDto} from "./dto/auth-credentials.dto";
import {JwtService} from "@nestjs/jwt";
import {JwtPayload} from "./jwt-payload.interface";
import {User} from "./User.entity";

@Injectable()
export class AuthService {

    private logger = new Logger('AuthService');

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService) {
    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userRepository.signUp(authCredentialsDto);
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string }> {
        const username = await this.userRepository.validateUserPassword(authCredentialsDto);

        if (!username) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {username};

        const accessToken = await this.jwtService.sign(payload);

        this.logger.debug(`Generated JWT token with payload: ${JSON.stringify(payload)} `);

        return {accessToken};
    }

    async deleteUser(user: User): Promise<void> {
        const result = await this.userRepository.delete({id: user.id});
        this.logger.debug(`Deleted user with id: ${user.id}`)
        if (result.affected === 0) {
            throw new NotFoundException(`User with id: ${user.id} not found`);
        }
    }
}
