import {
  Controller,
  Get,
  Req,
  Post,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/user.model';

type RequestType = Request & { user: User };

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Passport automatically creates a user object,
  // based on the value we return from the validate() method,
  // and assigns it to the Request object as req.user
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestType) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Req() req: Request) {
    const { body } = req;
    if (!body.username || !body.password || !body.email) {
      throw new HttpException('Bad request data', HttpStatus.BAD_REQUEST);
    }
    return this.authService.signup(req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
