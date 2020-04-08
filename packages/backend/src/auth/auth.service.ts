import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOne(username);
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

  async login(user: User | null) {
    if (user) {
      const payload = { username: user.username };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
    return null;
  }

  async signup(user: User): Promise<string> {
    const res = await this.usersService.create({
      ...user,
      username: user.username.toLowerCase(),
      displayUsername: user.username,
    });
    return `Signed up username: ${res.username}.`;
  }
}
