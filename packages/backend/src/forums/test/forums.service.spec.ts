import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';
import { ForumsService } from '../forums.service';
import { mockForumPost } from './forums.consts';

describe('ForumsService', () => {
  let service: ForumsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken('ForumPost'),
          useValue: mockForumPost,
        }, ForumsService],
    }).compile();

    service = module.get<ForumsService>(ForumsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
