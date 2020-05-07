import * as httpMocks from 'node-mocks-http';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { AllChatController } from './all-chat.controller';
import { AllChatService } from './all-chat.service';
import { AllChatGateway } from './all-chat.gateway';
import { CommandsModule } from '../commands/commands.module';

describe('Chat Controller', () => {
  let controller: AllChatController;
  let service: AllChatService;
  let res: httpMocks.MockResponse<any>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommandsModule],
      controllers: [AllChatController],
      providers: [AllChatService, AllChatGateway],
    }).compile();

    controller = module.get<AllChatController>(AllChatController);
    service = module.get<AllChatService>(AllChatService);
    res = httpMocks.createResponse();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
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
