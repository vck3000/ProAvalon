import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DocumentType } from '@typegoose/typegoose';
import { Response } from 'express';
import { User as UserProto } from '@proavalon/proto';
import CreateUserDto = UserProto.CreateUserDto;
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { SignUpError } from './exceptions/signUpError';
import { JWT_EXPIRY } from '../util/getEnvVars';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    displayUsername: string,
    pass: string,
  ): Promise<DocumentType<User> | null> {
    const user = await this.usersService.findByUsername(
      displayUsername.toLowerCase(),
    );
    if (
      user &&
      (await this.usersService.comparePassword(pass, user.password))
    ) {
      return user;
    }

    return null;
  }

  async login(user: CreateUserDto | null) {
    if (user) {
      const payload = { username: user.username };
      return {
        token: this.jwtService.sign(payload),
        expires: JWT_EXPIRY,
      };
    }
    return null;
  }

  async signup(user: CreateUserDto, res: Response): Promise<Response<any>> {
    const usernameRes = await this.usersService.findByUsername(user.username);
    if (usernameRes) {
      throw new SignUpError(
        `Username already exists: ${usernameRes.username}.`,
      );
    }

    const emailRes = await this.usersService.findByEmail(user.email);
    if (emailRes) {
      throw new SignUpError(`Email already exists: ${emailRes.email}.`);
    }

    const createdUser = await this.usersService.create({
      ...user,
      username: user.username.toLowerCase(),
      displayUsername: user.username,
    });
    return res.send(`Signed up username: ${createdUser.username}.`);
  }
}
