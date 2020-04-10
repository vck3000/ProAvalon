import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
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
  username!: string;

  @MinLength(4, {
    message: 'Password must not have less than 4 characters.',
  })
  password!: string;

  @IsEmail(
    {},
    {
      message: 'Email must be valid.',
    },
  )
  email!: string;
}
