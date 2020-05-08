import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { CreateForumPostDto } from './dto/create-forumpost.dto';
import { CreateForumCommentDto } from './dto/create-forumcomment.dto';
import { ForumPost } from './model/forumpost.model';
import { ForumComment } from './model/forumcomment.model';

@Injectable()
export class ForumsService {
  constructor(
    @InjectModel(ForumPost) private readonly ForumPostModel: ReturnModelType<typeof ForumPost>,
    @InjectModel(
      ForumComment,
    ) private readonly ForumCommentModel: ReturnModelType<typeof ForumComment>,
  ) {}


  async addPost(createForumPostDto : CreateForumPostDto) {
    // #AddAuthorToPost
    // These posts are being created authorless atm,
    const result = await this.ForumPostModel.create(createForumPostDto);
    return result.id as string;
  }

  async addComment(createForumCommentDto : CreateForumCommentDto) {
    // #AddAuthorToPost
    // These posts are being created authorless atm,
    const result = await this.ForumCommentModel.create(createForumCommentDto);
    const parent = await this.findPost(createForumCommentDto.parentId);
    parent.replyIds.push(result.id as string);
    await parent.save();
    return result.id as string;
  }

  async getPosts() {
    const posts = await this.ForumPostModel
      .find()
      .limit(10000)
      .exec();
    return posts as ForumPost[];
  }

  async getPost(id: string) {
    return this.findPost(id);
  }

  async getComments(id: string) {
    const parent = await this.findPost(id);
    const commentIds = parent.replyIds;
    const comments = await this.ForumCommentModel.find({
      _id: commentIds,
    });
    return comments as ForumComment[];
  }

  private async findPost(id: string): Promise<any> {
    const post = await this.ForumPostModel.findById(id);
    if (!post) {
      throw new NotFoundException('Could not find forum post.');
    }
    return post;
  }
}
