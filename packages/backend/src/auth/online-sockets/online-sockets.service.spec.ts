import { Test, TestingModule } from '@nestjs/testing';
import { OnlineSocketsService } from './online-sockets.service';

describe('OnlinePlayersService', () => {
  let service: OnlineSocketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineSocketsService],
    }).compile();

    service = module.get<OnlineSocketsService>(OnlineSocketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
