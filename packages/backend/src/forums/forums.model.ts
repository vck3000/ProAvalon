import { prop } from '@typegoose/typegoose';

export class ForumPost {
  @prop({ required: true, lowercase: true })
  author!: string;

  @prop({ required: true })
  title!: string;

  @prop({ required: true })
  text!: string;
}
