import { IsDefined, IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateForumCommentDto {
  @IsNotEmpty({
    message: 'Text should not be empty.',
  })
  @IsDefined({
    message: 'Text is missing.',
  })
  text!: string;

  @IsMongoId({
    message: 'ParentId should be a valid mongo Id.',
  })
  parentId!: string;
}

export class CreateForumPostDto {
  @IsNotEmpty({
    message: 'Title should not be empty.',
  })
  @IsDefined({
    message: 'Title is missing.',
  })
  title!: string;

  @IsNotEmpty({
    message: 'Text should not be empty.',
  })
  @IsDefined({
    message: 'Text is missing.',
  })
  text!: string;
}
