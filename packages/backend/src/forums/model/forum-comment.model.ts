import { prop, Ref } from '@typegoose/typegoose';

export class ForumComment {
  // #AddAuthorToPost
  // Switch to required once we are pulling author from the backend
  @prop({ required: false, lowercase: true })
  author!: string;

  @prop({ required: true })
  text!: string;

  @prop({ ref: ForumComment })
  replies!: Ref<ForumComment>[];

  @prop({ required: true })
  isTopLevel!: boolean;
}
