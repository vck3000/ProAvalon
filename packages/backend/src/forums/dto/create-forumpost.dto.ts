import { IsDefined, IsNotEmpty } from 'class-validator';

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
