import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';

import { ForumsController } from '../forums.controller';
import { ForumsService } from '../forums.service';
import { mockForumPost, mockForumComment } from './forums.consts';

describe('Forums Controller', () => {
  let controller: ForumsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumsController],
      providers: [
        {
          provide: getModelToken('ForumPost'),
          useValue: mockForumPost,
        },
        {
          provide: getModelToken('ForumComment'),
          useValue: mockForumComment,
        }, ForumsService],
    }).compile();

    controller = module.get<ForumsController>(ForumsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
