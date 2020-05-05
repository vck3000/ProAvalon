import { IsDefined, IsNotEmpty } from 'class-validator';

export class CreateForumpostDto {
  @IsNotEmpty({
    message: 'Author should not be empty.',
  })
  @IsDefined({
    message: 'Author is missing.',
  })
  author!: string;

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
