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
    const user = await this.usersService.findByUsername(username);
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
    const usernameRes = await this.usersService.findByUsername(user.username);
    if (usernameRes) return `Username already exists: ${usernameRes.username}.`;

    const emailRes = await this.usersService.findByEmail(user.email);
    if (emailRes) return `Email already exists: ${emailRes.email}.`;

    const res = await this.usersService.create({
      ...user,
      username: user.username.toLowerCase(),
      displayUsername: user.username,
    });
    return `Signed up username: ${res.username}.`;
  }
}
