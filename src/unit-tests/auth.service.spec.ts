import {Test} from "@nestjs/testing";
import {UserRepository} from "../auth/user.repository";
import {AuthService} from "../auth/auth.service";
import {JwtService} from "@nestjs/jwt";
import {AuthCredentialsDto} from "../auth/dto/auth-credentials.dto";
import {UnauthorizedException} from "@nestjs/common";

const signUp = jest.fn();
const sign = jest.fn();
const validateUserPassword = jest.fn();

const mockUserRepository = () => ({
    signUp: signUp,
    validateUserPassword: validateUserPassword
});

const mockJwtService = () => ({
    sign: sign
});

const authCredentialsDto: AuthCredentialsDto = {username: 'Test', password: 'Test'};
describe('AuthService', () => {
    let userRepository;
    let authService: AuthService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {provide: UserRepository, useFactory: mockUserRepository},
                {provide: JwtService, useFactory: mockJwtService}
            ]
        }).compile();
        userRepository = await module.get<UserRepository>(UserRepository);
        authService = await module.get<AuthService>(AuthService);
    });

    describe('signUp', () => {
        it('calls UserRepository.signUp() without throws', async () => {
            await expect(authService.signUp(authCredentialsDto)).resolves.toBeUndefined();
            expect(signUp).toHaveBeenCalledWith(authCredentialsDto);
        });
    });

    describe('signIn', () => {
        it('returns access token as credentials is valid', async () => {
            validateUserPassword.mockResolvedValue('Username');
            sign.mockResolvedValue('token');
            const result = await authService.signIn(authCredentialsDto);
            expect(result).toEqual({accessToken: 'token'});
            expect(validateUserPassword).toHaveBeenCalledWith(authCredentialsDto);
            expect(sign).toHaveBeenCalledWith({username: 'Username'});
        });

        it('throws UnauthorizedException as credentials is invalid', async () => {
            validateUserPassword.mockResolvedValue(null);
            await expect(authService.signIn(authCredentialsDto)).rejects.toThrow(UnauthorizedException);
            await expect(authService.signIn(authCredentialsDto)).rejects.toThrowError('Invalid credentials');
        });
    });
});