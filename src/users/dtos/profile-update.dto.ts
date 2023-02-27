import { IsString, IsOptional, Matches } from 'class-validator';

export class ProfileUpdateCredentials {
  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  department: string;

  @IsOptional()
  @IsString()
  faculty: string;
}
