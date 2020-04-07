import * as httpMocks from 'node-mocks-http';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatResponse, ChatResponses } from '../../proto/bundle';
import { getProtoTimestamp } from '../../proto/timestamp';

describe('Chat Controller', () => {
  let controller: ChatController;
  let service: ChatService;
  let res: httpMocks.MockResponse<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
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

  it('should return messages in binary form', async () => {
    // Seed some messages.
    const msg1 = ChatResponse.create({
      text: 'test',
      username: 'asdf',
      timestamp: getProtoTimestamp(),
      type: ChatResponse.ChatResponseType.CHAT,
    });

    const msg2 = ChatResponse.create({
      text: 'test2',
      username: 'asdf2',
      timestamp: getProtoTimestamp(),
      type: ChatResponse.ChatResponseType.CREATE_ROOM,
    });

    jest.spyOn(service, 'getMessages').mockImplementation(() => [msg1, msg2]);

    await controller.getAllMessages(res);

    expect(ChatResponses.decode(res._getData())).toEqual(
      ChatResponses.create({ chatResponses: [msg1, msg2] }),
    );
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
