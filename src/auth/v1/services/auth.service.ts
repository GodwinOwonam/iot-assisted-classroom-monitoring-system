import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { AuthRepository } from '../repositories/auth.repository';
import { IResponse } from '../../../interfaces/response.interface';
import { AUTH_ENUM, REGISTRATION_ENUM } from '../constants/enums/auth-enums';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { ChangePasswordCredentials } from 'src/auth/dtos/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async register(
    authSignupCredentials: SignUpCredentialsDto,
  ): Promise<IResponse> {
    const { password, confirmPassword } = authSignupCredentials;

    if (password !== confirmPassword) {
      throw new UnprocessableEntityException(
        REGISTRATION_ENUM.PASSWORD_MISMATCH,
      );
    }

    return {
      success: true,
      message: await this.authRepository.createUser(authSignupCredentials),
    };
  }

  async login(authCredentials: SignInCredentialsDto): Promise<IResponse> {
    return {
      success: true,
      message: { ...(await this.authRepository.login(authCredentials)) },
    };
  }

  async changePassword(
    user: UserDocument,
    changePasswordDetails: ChangePasswordCredentials,
  ): Promise<IResponse> {
    const { oldPassword, newPassword, confirmPassword } = changePasswordDetails;
    if (newPassword === oldPassword) {
      throw new UnprocessableEntityException(AUTH_ENUM.SAME_AS_OLD_PASSWORD);
    } else if (newPassword !== confirmPassword) {
      throw new UnprocessableEntityException(
        AUTH_ENUM.CHANGE_PASSWORD_MISMATCH,
      );
    }

    const changePasswordResponse = await this.authRepository.changePassword(
      user,
      changePasswordDetails,
    );

    return {
      success: true,
      message: changePasswordResponse,
    };
  }

  async logout(user: UserDocument): Promise<IResponse> {
    return {
      success: true,
      message: await this.authRepository.logout(user),
    };
  }

  async verifyLoginOtp(otp: string): Promise<IResponse> {
    return {
      success: true,
      message: AUTH_ENUM.LOGIN_SUCCESS,
      data: await this.authRepository.verifyLoginOtp(otp),
    };
  }
}
