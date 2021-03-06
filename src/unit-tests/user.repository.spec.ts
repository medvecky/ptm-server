import {Test} from "@nestjs/testing";
import {UserRepository} from "../auth/user.repository";
import {ConflictException, InternalServerErrorException} from "@nestjs/common";
import {User} from "../auth/User.entity";
import * as bcrypt from 'bcrypt';

const mockCredentialsDto = {username: 'TestUsername', password: 'TestPassword'};

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserRepository
            ]
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({save});
        });

        it('successfully signs up the user', async () => {
            save.mockResolvedValue(undefined);
            await expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('throws a conflict exception as username already exists', async () => {
            save.mockRejectedValue({code: 11000});
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrowError('username already exists');
        });

        it('throws an internal server error when something went wrong', async () => {
            save.mockRejectedValue({code: 12000});
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
            await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrowError('Internal Server Error');
        });
    });

    describe('validateUserPassword', () => {
        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();
            user = new User();
            user.username = 'TestUsername';
            user.validatePassword = jest.fn();
        });

        it('returns the username as validation is successful', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toEqual('TestUsername');
        });

        it('returns null as user cannot be found', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toBeNull();
        });

        it('returns null as password is invalid', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);
            const result = await userRepository.validateUserPassword(mockCredentialsDto);
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('calls bcrypt hash to generate hash', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('testHash');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await userRepository.hashPassword('testPassword', 'testSalt');
            expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
            expect(result).toEqual('testHash');
        });
    });
});