import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';

@Controller('allchat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getAllMessages(@Res() res: Response) {
    const messages = await this.chatService.getMessages();
    res.status(HttpStatus.OK).json(messages);
  }
}
