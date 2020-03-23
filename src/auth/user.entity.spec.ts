import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
  let user;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    bcrypt.hash = jest.fn();
  });
  describe('validatePassword', () => {
    it('return true as password is valid', async () => {
      bcrypt.hash.mockResolvedValue('testPassword');
      expect(bcrypt.hash).not.toBeCalled();
      const result = await user.validatePassword('typedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('typedPassword', 'testSalt');
      expect(result).toBe(true);
    });

    it('return false as password is invalid', async () => {
      bcrypt.hash.mockResolvedValue('wrongPassword');
      expect(bcrypt.hash).not.toBeCalled();
      const result = await user.validatePassword('typedPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('typedPassword', 'testSalt');
      expect(result).toBe(false);
    });
  });
});
