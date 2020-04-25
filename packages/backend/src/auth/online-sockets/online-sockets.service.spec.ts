import { Test, TestingModule } from '@nestjs/testing';
import { OnlineSocketsService } from './online-sockets.service';
import RedisClientService from '../../redis-client/redis-client.service';

describe('OnlinePlayersService', () => {
  let service: OnlineSocketsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [OnlineSocketsService, RedisClientService],
    }).compile();

    service = module.get<OnlineSocketsService>(OnlineSocketsService);
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
