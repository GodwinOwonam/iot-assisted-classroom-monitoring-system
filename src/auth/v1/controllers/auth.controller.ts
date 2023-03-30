import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { ChangePasswordCredentials } from 'src/auth/dtos/change-password.dto';
import { VerifyOtpCredentials } from 'src/auth/dtos/verify-otp.dto';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { IResponse } from 'src/interfaces/response.interface';
import { GetUser } from '../decorators/get-user.decorator';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() authCredentials: SignUpCredentialsDto) {
    return await this.authService.register(authCredentials);
  }

  @Post('sign-in')
  async login(@Body() authCredentials: SignInCredentialsDto) {
    return await this.authService.login(authCredentials);
  }

  @Post('verify-otp')
  async verifyLoginOtp(@Body() otpCredentials: VerifyOtpCredentials) {
    return await this.authService.verifyLoginOtp(otpCredentials.otp);
  }

  @UseGuards(AuthGuard())
  @Post('change-password')
  async changePassword(
    @GetUser() user: UserDocument,
    @Body() changePasswordDetails: ChangePasswordCredentials,
  ): Promise<IResponse> {
    return await this.authService.changePassword(user, changePasswordDetails);
  }

  @UseGuards(AuthGuard())
  @Post('logout')
  async logout(@GetUser() user: UserDocument): Promise<IResponse> {
    return await this.authService.logout(user);
  }

  // TODO: Implement reset password with otp from email

  @Get('super-admin')
  async createSuperAdmin(): Promise<IResponse> {
    return await this.authService.createSuperAdmin();
  }
}
