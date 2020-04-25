import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CommandsModule } from './commands/commands.module';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommandsModule],
      controllers: [ChatController],
      providers: [ChatService, ChatGateway],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
