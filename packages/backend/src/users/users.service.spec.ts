import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should compare passwords correctly', async () => {
    expect(
      await service.comparePassword(
        'test_password',
        '$2b$10$mu19Aeqb23jbI3Cg8.cV8.4L3aijINHasegzF6Mzc9DTuxZfvrGye',
      ),
    ).toBe(true);
  });
});
