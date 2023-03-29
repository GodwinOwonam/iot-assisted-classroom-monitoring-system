import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyOtpCredentials {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
