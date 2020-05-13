import { prop, Ref } from '@typegoose/typegoose';
import { ForumComment } from './forum-comment.model';

export class ForumPost {
  // #AddAuthorToPost
  // Switch to required once we are pulling author from the backend
  @prop({ required: false, lowercase: true })
  author!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  text!: string;

  @prop({ ref: ForumComment })
  replies!: Ref<ForumComment>[];
}
