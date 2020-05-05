import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';

import { ForumsController } from './forums.controller';
import { ForumsService } from './forums.service';
import { ForumPost } from './forums.model';

@Module({
  imports: [TypegooseModule.forFeature([ForumPost])],
  controllers: [ForumsController],
  providers: [ForumsService],
})
export class ForumsModule {}
