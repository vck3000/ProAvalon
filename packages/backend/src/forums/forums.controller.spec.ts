import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from 'nestjs-typegoose';

import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';

export const mockForumPost = {
  username: 'test_user',
  title: 'test post!',
  text: 'pls ignore',
};

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
