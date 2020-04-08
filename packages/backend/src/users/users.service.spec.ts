import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { UsersService } from './users.service';

export const mockUserModel = {
  username: 'test_user',
  usernameLower: 'test_user',
  password: '$2b$10$mu19Aeqb23jbI3Cg8.cV8.4L3aijINHasegzF6Mzc9DTuxZfvrGye',
  emailAddress: 'test_user@gmail.com',
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // a hardcoded userModel (object instance) will be provided
        // whenever any consumer injects a Model<User> using an @InjectModel() decorator
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        UsersService,
      ],
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
