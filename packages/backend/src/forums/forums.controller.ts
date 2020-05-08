import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumPostDto } from './dto/create-forumpost.dto';
import { CreateForumCommentDto } from './dto/create-forumcomment.dto';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post()
  async addNewForumPost(
    @Body() createForumPostDto: CreateForumPostDto,
  ) {
    const postId = await this.forumsService.addPost(createForumPostDto);
    return { id: postId };
  }

  @Post('reply')
  async addNewForumComment(
    @Body() createForumCommentDto: CreateForumCommentDto,
  ) {
    const commentId = await this.forumsService.addComment(createForumCommentDto);
    return { id: commentId };
  }

  @Get()
  async getAllPosts() {
    return this.forumsService.getPosts();
  }

  @Get(':id')
  async getPost(@Param('id') postId: string) {
    return this.forumsService.getPost(postId);
  }

  @Get(':id/comments')
  async getComments(@Param('id') parentId: string) {
    return this.forumsService.getComments(parentId);
  }
}
