import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { CreateForumPostDto } from './dto/create-forumpost.dto';
import { ForumPost } from './forums.model';

@Injectable()
export class ForumsService {
  constructor(
    @InjectModel(ForumPost) private readonly ForumPostModel: ReturnModelType<typeof ForumPost>,
  ) {}

  async addPost(createForumPostDto : CreateForumPostDto) {
    // #AddAuthorToPost
    // These posts are being created authorless atm,
    const result = await this.ForumPostModel.create(createForumPostDto);
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
    const post = await this.findPost(id);
    return post;
  }

  private async findPost(id: string): Promise<ForumPost> {
    const post = await this.ForumPostModel.findById(id);
    if (!post) {
      throw new NotFoundException('Could not find forum post.');
    }
    return post;
  }
}
