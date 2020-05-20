import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType, DocumentType } from '@typegoose/typegoose';
import {
  CreateForumPostDto,
  CreateForumCommentDto,
} from '@proavalon/proto/forums';

import { ForumPost } from './model/forum-post.model';
import { ForumComment } from './model/forum-comment.model';

@Injectable()
export class ForumsService {
  constructor(
    @InjectModel(ForumPost)
    private readonly ForumPostModel: ReturnModelType<typeof ForumPost>,
    @InjectModel(ForumComment)
    private readonly ForumCommentModel: ReturnModelType<typeof ForumComment>,
  ) {}

  async addPost(createForumPostDto: CreateForumPostDto) {
    // #AddAuthorToPost
    // These posts are being created authorless atm,
    const result = await this.ForumPostModel.create(createForumPostDto);
    return result.id as string;
  }

  async addComment(createForumCommentDto: CreateForumCommentDto) {
    // #AddAuthorToPost
    // These posts are being created authorless atm,
    let parent;
    let isTopLevel;
    parent = await this.ForumPostModel.findById(createForumCommentDto.parentId);
    if (parent) {
      isTopLevel = true;
    } else {
      parent = await this.ForumCommentModel.findById(
        createForumCommentDto.parentId,
      );

      if (!parent) {
        throw new NotFoundException(
          'Cannot find post or comment with specified id.',
        );
      }

      // Only allow 1 level of nesting
      if (!parent.isTopLevel) {
        throw new BadRequestException('Cannot reply to a non-parent comment.');
      }
      isTopLevel = false;
    }

    const result = await this.ForumCommentModel.create({
      ...createForumCommentDto,
      isTopLevel,
    });
    parent.replies.push(result.id);
    // This is a hack so Typescript is happy :)
    // Do not use the return value of this .save()!
    await (parent as DocumentType<ForumPost>).save();
    await result.save();
    return result.id as string;
  }

  async getPosts() {
    const posts = await this.ForumPostModel.find()
      .limit(10000)
      .exec();
    return posts as ForumPost[];
  }

  async getPost(id: string) {
    return this.findPost(id);
  }

  async getParentComments(id: string) {
    const parent = await this.findPost(id);
    const commentIds = parent.replies;
    const comments = await this.ForumCommentModel.find({
      _id: commentIds,
    });
    return comments as ForumComment[];
  }

  async getChildComments(id: string) {
    const parent = await this.findComment(id);
    const commentIds = parent.replies;
    const comments = await this.ForumCommentModel.find({
      _id: commentIds,
    });
    return comments as ForumComment[];
  }

  private async findPost(id: string): Promise<DocumentType<ForumPost>> {
    const post = await this.ForumPostModel.findById(id);
    if (!post) {
      throw new NotFoundException('Could not find forum post.');
    }
    return post;
  }

  private async findComment(id: string): Promise<DocumentType<ForumComment>> {
    const comment = await this.ForumCommentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Could not find forum comment.');
    }
    return comment;
  }
}
