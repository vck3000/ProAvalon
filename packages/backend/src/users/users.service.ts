import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User } from './user.model';

import bcrypt = require('bcrypt');
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly UserModel: ReturnModelType<typeof User>,
  ) {}

  async comparePassword(
    password: User['password'],
    hash: User['password'],
  ): Promise<boolean> {
    const res = await bcrypt.compare(password, hash);
    return res;
  }

  async create(createUserData: User): Promise<User> {
    const createUserDataHashed = {
      ...createUserData,
      password: await bcrypt.hash(createUserData.password, 10),
    };

    return this.UserModel.create(createUserDataHashed);
  }

  async findOne(username: User['username']) {
    const user = await this.UserModel.findOne({
      username: username.toLowerCase(),
    });
    return user;
  }
}
