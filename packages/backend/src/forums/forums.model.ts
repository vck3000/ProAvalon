import { prop } from '@typegoose/typegoose';

export class ForumPost {
  // #AddAuthorToPost
  // Switch to required once we are pulling author from the backend
  @prop({ required: false, lowercase: true })
  author!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  text!: string;
}
