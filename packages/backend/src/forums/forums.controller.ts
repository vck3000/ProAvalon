import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Forum } from '@proavalon/proto';
import CreateForumPostDto = Forum.CreateForumPostDto;
import CreateForumCommentDto = Forum.CreateForumCommentDto;
import { ForumsService } from './forums.service';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Post()
  async addNewForumPost(@Body() createForumPostDto: CreateForumPostDto) {
    const postId = await this.forumsService.addPost(createForumPostDto);
    return { id: postId };
  }

  @Post('comment')
  async addNewForumComment(
    @Body() createForumCommentDto: CreateForumCommentDto,
  ) {
    const commentId = await this.forumsService.addComment(
      createForumCommentDto,
    );
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
    return this.forumsService.getParentComments(parentId);
  }

  @Get(':id/comment-replies')
  async getCommentReplies(@Param('id') parentId: string) {
    return this.forumsService.getChildComments(parentId);
  }
}
