import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import * as bcrypt from 'bcryptjs';

import { User } from './user.model';

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

  async findByUsername(username: User['username']) {
    const user = await this.UserModel.findOne({
      username: username.toLowerCase(),
    });
    return user;
  }

  async findByEmail(email: User['email']) {
    const user = await this.UserModel.findOne({
      email,
    });
    return user;
  }

  async updateDisplayUsername(displayUsername: User['displayUsername']) {
    const res = await this.UserModel.findOneAndUpdate(
      { username: displayUsername.toLowerCase() },
      { displayUsername },
    );
    return res;
  }
}
