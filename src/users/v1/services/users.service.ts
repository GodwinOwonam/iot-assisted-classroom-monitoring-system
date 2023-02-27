import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { IResponse } from 'src/interfaces/response.interface';
import { ProfileUpdateCredentials } from 'src/users/dtos/profile-update.dto';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async viewProfile(user: UserDocument): Promise<IResponse> {
    const profile = await this.usersRepository.getProfile(user);

    return {
      success: true,
      data: {
        user: {
          username: user.username,
          email: user.email,
        },
        profile,
      },
    };
  }

  async updateProfile(
    updateProfileDto: ProfileUpdateCredentials,
    user: UserDocument,
  ): Promise<IResponse> {
    await this.usersRepository.updateProfile(user, updateProfileDto);

    return this.viewProfile(user);
  }

  async updateProfilePhoto(
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<any | IResponse> {
    const fileName = file?.filename;

    if (!fileName) {
      throw new UnprocessableEntityException('file must be a png, jpg/jpeg');
    }

    await this.usersRepository.updateProfilePhoto(user, fileName);

    return await this.viewProfile(user);
  }

  async viewProfilePhoto(res, user: UserDocument): Promise<IResponse> {
    const profile = await this.usersRepository.getProfile(user);

    return await res.sendFile(profile.photoFileName, {
      root: './src/images/profiles',
    });
  }
}
