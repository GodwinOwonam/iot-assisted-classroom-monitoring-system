import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SignUpCredentialsDto } from 'src/auth/dtos/auth-signup.dto';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import {
  REGISTRATION_ENUM,
  AUTH_ENUM,
  OTP_TYPES,
} from '../constants/enums/auth-enums';
import { SignInCredentialsDto } from 'src/auth/dtos/auth-sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordCredentials } from 'src/auth/dtos/change-password.dto';
import { getFromEnv } from 'src/helpers/env.helper';
import { IResponse } from 'src/interfaces/response.interface';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(User.name)
    private model: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(
    authSignupCredentials: SignUpCredentialsDto,
  ): Promise<string> {
    try {
      const { username, email, password } = authSignupCredentials;

      const hashedPassword = await this.hashPassword(password);

      const user = await this.model.create({
        username,
        email,
        password: hashedPassword,
        requiresLogin: true,
        otp: await this.generateOtp(),
        otpType: OTP_TYPES.LOGIN,
        isAdmin: false,
        isSuperAdmin: false,
        isVerified: false,
        otpStatus: false,
        otpExpiry: new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            new Date().getUTCHours() + 1,
            5,
          ),
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (user) {
        return await this.sendUserOtp(user);
      }

      return REGISTRATION_ENUM.REGISTRATION_FAILED;
    } catch (error) {
      if (error.code == 11000) {
        if (error.keyPattern?.username) {
          throw new ConflictException(REGISTRATION_ENUM.USERNAME_CONFLICT);
        } else if (error.keyPattern?.email) {
          throw new ConflictException(REGISTRATION_ENUM.EMAIL_CONFLICT);
        }
      }

      throw new InternalServerErrorException();
    }
  }

  async login(authCredentials: SignInCredentialsDto): Promise<any> {
    const { email, password } = authCredentials;

    const user = await this.model.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(AUTH_ENUM.INVALID_CREDENTIALS);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(AUTH_ENUM.UNVERIFIED_ACCOUNT);
    }

    await this.invalidateUser(user);
    return await this.sendUserOtp(user);
  }

  async verifyLoginOtp(otp: string): Promise<any> {
    try {
      const user = await this.model.findOne({ otp });

      if (!user) {
        throw new UnauthorizedException(AUTH_ENUM.UNAUTHORIZED);
      }

      if (user.otpType != OTP_TYPES.LOGIN) {
        throw new UnauthorizedException(AUTH_ENUM.INVALID_OTP);
      }

      const verified = await this.verifyUserOtp(otp);
      if (!verified.success) {
        return AUTH_ENUM.UNVERIFIED_ACCOUNT;
      }

      return await this.grantCredentials(verified.data);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async verifyUserOtp(otp: string): Promise<any> {
    const user = await this.model.findOne({ otp });

    if (!user) {
      throw new UnauthorizedException(AUTH_ENUM.UNAUTHORIZED);
    }

    const currentDate = new Date();

    if (user.otpExpiry < currentDate) {
      throw new UnprocessableEntityException(AUTH_ENUM.OTP_EXPIRED);
    }

    if (user.otpStatus) {
      throw new UnprocessableEntityException(AUTH_ENUM.INVALID_OTP);
    }

    await this.model.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        isVerified: true,
        otpStatus: true,
      },
    );

    await this.invalidateUser(user);
    return {
      success: true,
      message: AUTH_ENUM.OTP_VERIFIED_SUCCESS,
      data: user,
    };
  }

  private async sendUserOtp(user: UserDocument): Promise<any> {
    const otp = await this.generateOtp();

    await this.model.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        otp,
        otpStatus: false,
        otpType: OTP_TYPES.LOGIN,
        otpExpiry: new Date(
          Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate(),
            new Date().getUTCHours() + 1,
            new Date().getUTCMinutes() + 5,
          ),
        ),
      },
    );

    const updatedUser = await this.model.findOne({ _id: user._id });
    return {
      otp: updatedUser.otp,
      expires: updatedUser.otpExpiry,
    };
  }

  private async grantCredentials(user: UserDocument): Promise<any> {
    const payload = { username: user.username };
    const jwt_secret = getFromEnv('jwt_secret');
    const jwt_expiry = getFromEnv('jwt_expiry');

    const accessToken = this.jwtService.sign(payload, {
      secret: jwt_secret,
      expiresIn: +jwt_expiry,
    });

    await this.loginUser(user);

    return {
      user: { username: user.username, email: user.email },
      accessToken,
    };
  }

  async changePassword(
    user: UserDocument,
    changePasswordDetails: ChangePasswordCredentials,
  ): Promise<string> {
    const { oldPassword, newPassword } = changePasswordDetails;

    if (!(await bcrypt.compare(oldPassword, user.password))) {
      throw new UnprocessableEntityException(AUTH_ENUM.INVALID_CREDENTIALS);
    }

    const hashedPassword = await this.hashPassword(newPassword);

    await this.model.findOneAndUpdate(
      { _id: user._id },
      {
        password: hashedPassword,
      },
    );

    await this.invalidateUser(user);

    return AUTH_ENUM.PASSWORD_CHANGED_SUCCESS;
  }

  async logout(user: UserDocument): Promise<string> {
    await this.invalidateUser(user);

    return AUTH_ENUM.LOGOUT_SUCCESS;
  }

  async createSuperAdmin(
    authSignupCredentials: SignUpCredentialsDto,
  ): Promise<string> {
    try {
      const superAdmin = await this.model.findOne({ isSuperAdmin: true });

      if (!superAdmin) {
        const { username, email, password } = authSignupCredentials;

        const hashedPassword = await this.hashPassword(password);

        await this.model.create({
          username,
          email,
          password: hashedPassword,
          requiresLogin: true,
          otp: await this.generateOtp(),
          otpType: OTP_TYPES.LOGIN,
          isAdmin: true,
          isSuperAdmin: true,
          isVerified: true,
          otpStatus: true,
          otpExpiry: new Date(
            Date.UTC(
              new Date().getUTCFullYear(),
              new Date().getUTCMonth(),
              new Date().getUTCDate(),
              new Date().getUTCHours() + 1,
              5,
            ),
          ),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return REGISTRATION_ENUM.SUCCESS;
    } catch (error) {
      if (error.code == 11000) {
        if (error.keyPattern?.username) {
          throw new ConflictException(REGISTRATION_ENUM.USERNAME_CONFLICT);
        } else if (error.keyPattern?.email) {
          throw new ConflictException(REGISTRATION_ENUM.EMAIL_CONFLICT);
        }
      }

      throw new InternalServerErrorException();
    }
  }

  async deleteAllUsers(): Promise<any> {
    return this.model.deleteMany();
  }

  // Private functions begin here

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }

  private async loginUser(user: UserDocument): Promise<void> {
    await this.model.findOneAndUpdate(
      { _id: user._id },
      {
        requiresLogin: false,
      },
    );
  }

  async invalidateUser(user: UserDocument): Promise<void> {
    await this.model.findOneAndUpdate(
      { _id: user._id },
      {
        requiresLogin: true,
      },
    );
  }

  private async generateOtp() {
    let user: UserDocument | null = null;
    let otp = '';

    do {
      otp += String(Math.ceil(Math.random() * 9999999));
      if (otp.length > 6) {
        otp = otp.substring(0, 6);
      }
      user = await this.model.findOne({ otp });
    } while (user || otp.length < 6);

    return otp;
  }
}
