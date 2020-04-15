import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatResponse, ChatResponseType } from '../../proto/lobbyProto';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [ChatController],
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should store messages correctly', () => {
    const msg: ChatResponse = {
      text: 'test',
      username: 'asdf',
      timestamp: new Date(),
      type: ChatResponseType.CHAT,
    };

    expect(service.storeMessage(msg)).toEqual(msg);
    expect(service.getMessages()[0]).toEqual(msg);
    expect(service.getMessages().length).toEqual(1);
  });

  it('should not overflow past 50 messages', () => {
    for (let i = 0; i < 60; i += 1) {
      const msg: ChatResponse = {
        text: 'test',
        username: 'asdf',
        timestamp: new Date(),
        type: ChatResponseType.CHAT,
      };

      expect(service.storeMessage(msg)).toEqual(msg);
    }
    expect(service.getMessages().length).toEqual(50);
  });
});
