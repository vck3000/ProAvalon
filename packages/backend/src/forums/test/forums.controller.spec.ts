import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';

import { ForumsController } from '../forums.controller';
import { ForumsService } from '../forums.service';
import { mockForumPost } from './forums.consts';

describe('Forums Controller', () => {
  let controller: ForumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumsController],
      providers: [
        {
          provide: getModelToken('ForumPost'),
          useValue: mockForumPost,
        }, ForumsService],
    }).compile();

    controller = module.get<ForumsController>(ForumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
