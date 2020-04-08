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
    if (user && this.usersService.comparePassword(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  // TODO Fix up these any's soon!
  async login(user: User | undefined) {
    if (user) {
      const payload = { username: user.username };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
    return null;
  }

  async signup(user: User): Promise<string> {
    const { username, password, emailAddress } = user;
    const res = await this.usersService.save({
      username,
      usernameLower: username.toLowerCase(),
      password,
      emailAddress,
    });
    // might want to change this to the response object in the future
    return `Signed up username: ${res.username}`;
  }
}
