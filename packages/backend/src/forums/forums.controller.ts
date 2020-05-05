import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ForumsService } from './forums.service';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post()
  async addNewForumPost(
    @Body('text') username: string,
    @Body('text') title: string,
    @Body('text') text: string,
  ) {
    const postId = await this.forumsService.addPost(
      username,
      title,
      text,
    );
    return { id: postId };
  }

  @Get()
  async getAllPosts() {
    const posts = await this.forumsService.getPosts();
    return posts;
  }

  @Get(':id')
  getThread(@Param('id') threadId: string) {
    return threadId;
  }
}
