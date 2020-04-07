import { Controller, Get, Req, Post, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Passport automatically creates a user object,
  // based on the value we return from the validate() method,
  // and assigns it to the Request object as req.user
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Req() req: Request) {
    return this.authService.signup(req.body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return req.user;
  }
}
