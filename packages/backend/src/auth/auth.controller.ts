import {
  Controller,
  Get,
  Req,
  Res,
  Post,
  UseGuards,
  Body,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { User } from '../users/user.model';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignUpError } from './exceptions/signUpError';

type RequestType = Request & { user: ReturnModelType<typeof User> };

interface RequestUser extends Request {
  user: DocumentType<User>;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  // Passport automatically creates a user object,
  // based on the value we return from the validate() method,
  // and assigns it to the Request object as req.user
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: RequestType) {
    this.logger.log(`${req.user.displayUsername} logged in.`);
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
  getProfile(@Req() req: RequestUser) {
    const { username } = req.user.toObject();
    const result = { username };
    return result;
  }
}
