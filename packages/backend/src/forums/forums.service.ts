import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';

import { CreateForumpostDto } from './dto/create-forumpost.dto';
import { ForumPost } from './forums.model';

@Injectable()
export class ForumsService {
  constructor(
    @InjectModel(ForumPost) private readonly ForumPostModel: ReturnModelType<typeof ForumPost>,
  ) {}

  async addPost(createForumpostDto : CreateForumpostDto) {
    const newPost = new this.ForumPostModel(createForumpostDto);
    const result = await newPost.save();
    return result.id as string;
  }

  async getPosts() {
    const posts = await this.ForumPostModel.find().exec();
    return posts as ForumPost[];
  }

  async getSinglePost(id: string) {
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
