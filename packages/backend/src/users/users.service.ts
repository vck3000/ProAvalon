import { Injectable } from '@nestjs/common';

import bcrypt = require('bcrypt');

export type User = {
  userId: string;
  username: string;
  password: string;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  async comparePassword(
    password: User['password'],
    hash: User['password'],
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async save({ username, password }: Pick<User, 'username' | 'password'>) {
    const { users } = this;
    return bcrypt.hash(password, 10, (err, hash): Error | User => {
      if (err) return err;
      const user = {
        userId: users.length.toString(),
        username,
        password: hash,
      };
      users.push(user);
      return user;
    });
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
