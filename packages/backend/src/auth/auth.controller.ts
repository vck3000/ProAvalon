import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/user.model';
import { CreateUserDto } from '../users/dto/create-user.dto';

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
  async signup(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    return this.authService.signup(createUserDto, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
