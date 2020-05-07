import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AllChatService } from './all-chat.service';
import { ChatResponse } from '../../proto/lobbyProto';

@Controller('allchat')
export class AllChatController {
  constructor(private allChatService: AllChatService) {}

  @Get()
  async getAllMessages(@Res() res: Response) {
    const messages: ChatResponse[] = await this.allChatService.getMessages();

    res.send(messages);
  }

  @Get('/json')
  async getAllMessagesJSON(@Res() res: Response) {
    const messages = await this.allChatService.getMessages();
    res.status(HttpStatus.OK).json(messages);
  }

  @Get('/deleteall')
  async deleteAllMessages(@Res() res: Response) {
    await this.allChatService.deleteAllMessages();
    res.status(HttpStatus.OK).send('Deleted all messages');
  }
}
