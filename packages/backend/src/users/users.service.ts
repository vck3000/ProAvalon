import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';

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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.UserModel(createUserDto);
    const res = await createdUser.save();
    return res;
  }

  async save({
    username,
    usernameLower,
    password,
    emailAddress,
  }: CreateUserDto): Promise<User> {
    const hash = await bcrypt.hash(password, 10);
    return this.create({
      username,
      usernameLower,
      password: hash,
      emailAddress,
    });
  }

  async findOne(username: User['username']): Promise<User | null> {
    const user = await this.UserModel.findOne({
      usernameLower: username.toLowerCase(),
    });
    return user;
  }
}
