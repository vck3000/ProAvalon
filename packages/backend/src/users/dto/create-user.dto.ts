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
  @Matches(/^[\w.-]+$/, {
    message: 'Username must not contain illegal characters.',
  })
  @Matches(/^[^(-._)][\w.-]+[^(-._)]+$/, {
    message:
      'Username must not start with or end with an underscore, hyphen or period.',
  })
  @Matches(/^[^(-._)]*(?:[-._][^-._]+)*$/, {
    message:
      'Username must not have more than one underscore, hyphen or period in succession.',
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
