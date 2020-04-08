import { prop } from '@typegoose/typegoose';

export class User {
  @prop({ required: true })
  username!: string;

  @prop()
  usernameLower!: string;

  @prop()
  password!: string;

  @prop()
  emailAddress!: string;
}
