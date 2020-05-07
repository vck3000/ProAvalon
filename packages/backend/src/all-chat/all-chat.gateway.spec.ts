import { Test, TestingModule } from '@nestjs/testing';
import { AllChatGateway } from './all-chat.gateway';
import { AllChatController } from './all-chat.controller';
import { AllChatService } from './all-chat.service';
import { CommandsModule } from '../commands/commands.module';

describe('AllChatGateway', () => {
  let gateway: AllChatGateway;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommandsModule],
      controllers: [AllChatController],
      providers: [AllChatService, AllChatGateway],
    }).compile();

    gateway = module.get<AllChatGateway>(AllChatGateway);
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
