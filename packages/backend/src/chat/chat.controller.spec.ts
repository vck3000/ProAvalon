import * as httpMocks from 'node-mocks-http';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CommandsModule } from './commands/commands.module';

describe('Chat Controller', () => {
  let controller: ChatController;
  let service: ChatService;
  let res: httpMocks.MockResponse<any>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommandsModule],
      controllers: [ChatController],
      providers: [ChatService, ChatGateway],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
    res = httpMocks.createResponse();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  // Not the best test to make - highly coupled.
  // This is to learn how jest works!
  it('should delete messages', async () => {
    const spy = jest.spyOn(service, 'deleteAllMessages');

    await controller.deleteAllMessages(res);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(res._getStatusCode()).toEqual(HttpStatus.OK);
    expect(res._getData()).toEqual('Deleted all messages');
  });
});
