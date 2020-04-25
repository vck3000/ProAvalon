import { Test, TestingModule } from '@nestjs/testing';
import { OnlinePlayersService } from './online-players.service';
import RedisClientModule from '../../redis-client/redis-client.module';

describe('OnlinePlayersService', () => {
  let service: OnlinePlayersService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RedisClientModule],
      providers: [OnlinePlayersService],
    }).compile();

    service = module.get<OnlinePlayersService>(OnlinePlayersService);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
