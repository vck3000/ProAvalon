import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';
import { ForumPost } from './model/forum-post.model';
import { ForumComment } from './model/forum-comment.model';

@Module({
  imports: [TypegooseModule.forFeature([ForumPost, ForumComment])],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}
