import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from './online-players.service';

describe('OnlinePlayersService', () => {
  let service: OnlinePlayersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlinePlayersService],
    }).compile();

    service = module.get<OnlinePlayersService>(OnlinePlayersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
