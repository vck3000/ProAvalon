import { validateOrReject } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDTO', () => {
  let userDTO: CreateUserDto;

  beforeEach(async () => {
    userDTO = new CreateUserDto();
    userDTO.username = 'good_username';
    userDTO.password = 'good_password';
    userDTO.email = 'good_email@gmail.com';
  });

  it('base case should pass', async () => {
    await expect(validateOrReject(userDTO)).resolves.toBeUndefined();
  });

  it('should not allow bad usernames', async () => {
    userDTO.username = '';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = ' ';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = 'bad username';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = 'ab.-cd';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = '_';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = 't_';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.username = 'test_user_test_user_test_user';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();
  });

  it('should not allow short passwords', async () => {
    userDTO.password = 'asd';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO.password = 'asdf';
    await expect(validateOrReject(userDTO)).resolves.toBeUndefined();
  });

  it('should not allow bad emails', async () => {
    userDTO.email = 'test@g';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();
  });

  it('should not allow undefined attributes', async () => {
    userDTO = new CreateUserDto();
    // missing username
    userDTO.password = 'good_password';
    userDTO.email = 'good_email@gmail.com';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO = new CreateUserDto();
    userDTO.username = 'good_username';
    // missing password
    userDTO.email = 'good_email@gmail.com';
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();

    userDTO = new CreateUserDto();
    userDTO.username = 'good_username';
    userDTO.password = 'good_password';
    // missing email
    await expect(validateOrReject(userDTO)).rejects.toBeTruthy();
  });
});
