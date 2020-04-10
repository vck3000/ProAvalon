import { prop } from '@typegoose/typegoose';

export class User {
  @prop({ required: true, lowercase: true })
  username!: string;

  @prop({ required: true })
  displayUsername!: string;

  @prop({ required: true })
  password!: string;

  @prop({ required: true })
  email!: string;
}
