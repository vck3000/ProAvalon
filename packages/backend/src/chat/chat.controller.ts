import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatResponses } from '../../proto/bundle';

@Controller('allchat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getAllMessages(@Res() res: Response) {
    const messages = await this.chatService.getMessages();

    const arr = ChatResponses.encode(
      ChatResponses.create({
        chatResponses: messages,
      }),
    ).finish();

    res.contentType('application/octet-stream');
    res.send(arr);
  }

  @Get('/json')
  async getAllMessagesJSON(@Res() res: Response) {
    const messages = await this.chatService.getMessages();
    res.status(HttpStatus.OK).json(messages);
  }
}
