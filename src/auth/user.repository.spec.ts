import { UserRepository } from './user.repository';
import { Test } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentialDto = { username: 'test', password: 'testPassword' };

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserRepository],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockResolvedValue({ save });
    });

    it('successfully sign up the user', () => {
      save.mockResolvedValue(undefined);
      expect(userRepository.signUp(mockCredentialDto)).resolves.not.toThrow();
    });

    it('throw conflict exception', () => {
      save.mockResolvedValue({ code: '23505' });
      expect(userRepository.signUp(mockCredentialDto)).resolves.toThrow(
        ConflictException,
      );
    });

    it('throw internal server error exception', () => {
      save.mockResolvedValue({ code: '23501' });
      expect(userRepository.signUp(mockCredentialDto)).resolves.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();

      user = new User();
      user.username = 'testUsername';
      user.validatePassword = jest.fn();
    });

    it('returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(user.username);

      const result = await userRepository.validateUserPassword(
        mockCredentialDto,
      );
      expect(result).toEqual('testUsername');
    });

    it('return null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.validateUserPassword(
        mockCredentialDto,
      );
      expect(user.validatePassword).not.toBeCalled();
      expect(result).toBeNull();
    });

    it('return null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);

      const result = await userRepository.validateUserPassword(
        mockCredentialDto,
      );

      expect(user.validatePassword).toBeCalled();
      expect(result).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('call bcrypt to generate a password', async () => {
      bcrypt.hash = jest.fn().mockResolvedValue('testHash');

      expect(bcrypt.hash).not.toBeCalled();
      const result = await userRepository.hashPassword(
        'testPassword',
        'testSalt',
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toBe('testHash');
    });
  });
});
