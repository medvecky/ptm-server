import {User} from '../auth/User.entity';
import * as bcrypt from 'bcrypt';
import exp from "constants";

describe('User entity', () => {
    let user: User;

    beforeEach(() => {
        user = new User();
        user.salt = 'testSalt';
        user.password = 'testPassword';
        bcrypt.hash = jest.fn();
    });

    describe('validatePassword', () => {
        it('returns true as password is valid', async () => {
            bcrypt.hash.mockReturnValue('testPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
            expect(result).toEqual(true);
        });
        it('returns false as password is invalid', async () => {
            bcrypt.hash.mockReturnValue('wrongPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
            expect(result).toEqual(false);
        });
    });
});