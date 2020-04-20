import { Test, TestingModule } from '@nestjs/testing';
import { UserCommandsService } from './user-commands.service';

describe('UserCommandsService', () => {
  let service: UserCommandsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCommandsService],
    }).compile();

    service = module.get<UserCommandsService>(UserCommandsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
