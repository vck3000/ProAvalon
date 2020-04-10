import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsDefined,
} from 'class-validator';

export class CreateUserDto {
  @MaxLength(25, {
    message: 'Username must not have more than 25 characters.',
  })
  @Matches(/^\w+$/, {
    message: 'Username must not contain illegal characters.',
  })
  @Matches(/^[a-zA-Z0-9][\w]+[a-zA-Z0-9]$/, {
    message: 'Username must not start or end with underscore or hyphen.',
  })
  @IsNotEmpty({
    message: 'Username should not be empty.',
  })
  @IsDefined({
    message: 'Username is missing.',
  })
  username!: string;

  @MinLength(4, {
    message: 'Password must not have less than 4 characters.',
  })
  @IsDefined({
    message: 'Password is missing.',
  })
  password!: string;

  @IsEmail(
    {},
    {
      message: 'Email must be valid.',
    },
  )
  @IsDefined({
    message: 'Email is missing.',
  })
  email!: string;
}
