import { Test, TestingModule } from '@nestjs/testing';
import { ChatResponse, ChatResponseType } from '@proavalon/proto';
import { AllChatService } from './all-chat.service';
import { AllChatController } from './all-chat.controller';

describe('AllChatService', () => {
  let service: AllChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [AllChatController],
      providers: [AllChatService],
    }).compile();

    service = module.get<AllChatService>(AllChatService);
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
