import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatResponse } from '../../proto/lobbyProto';

@Controller('allchat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getAllMessages(@Res() res: Response) {
    const messages: ChatResponse[] = await this.chatService.getMessages();

    res.send(messages);
  }

  @Get('/json')
  async getAllMessagesJSON(@Res() res: Response) {
    const messages = await this.chatService.getMessages();
    res.status(HttpStatus.OK).json(messages);
  }

  @Get('/deleteall')
  async deleteAllMessages(@Res() res: Response) {
    await this.chatService.deleteAllMessages();
    res.status(HttpStatus.OK).send('Deleted all messages');
  }
}
