import { prop } from '@typegoose/typegoose';

export class ForumPost {
  @prop({ required: true, lowercase: true })
  username!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  text!: string;
}
