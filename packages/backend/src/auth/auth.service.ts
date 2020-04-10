import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignUpError } from './exceptions/signUpError';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username.toLowerCase());
    if (
      user &&
      (await this.usersService.comparePassword(pass, user.password))
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user.toObject();
      return result;
    }

    return null;
  }

  async login(user: CreateUserDto | null) {
    if (user) {
      const payload = { username: user.username };
      return {
        accessToken: this.jwtService.sign(payload),
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
