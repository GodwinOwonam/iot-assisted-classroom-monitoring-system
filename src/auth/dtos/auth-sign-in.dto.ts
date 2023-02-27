import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SignInCredentialsDto {
  @IsNotEmpty()
  @IsString()
  @Matches(
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
    {
      message: 'Invalid email!',
    },
  )
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
