import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/user.model';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignUpError } from './exceptions/signUpError';

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
    try {
      return await this.authService.signup(createUserDto, res);
    } catch (e) {
      if (e instanceof SignUpError) {
        return res.status(HttpStatus.BAD_REQUEST).send(e.message);
      }
    }
    // This should not happen. Just in case.
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
