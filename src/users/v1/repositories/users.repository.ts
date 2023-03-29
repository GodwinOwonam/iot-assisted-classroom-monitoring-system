import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import * as process from 'process';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { PROFILE_ENUMS } from 'src/auth/v1/constants/profile-enums';
import { getFromEnv } from 'src/helpers/env.helper';
import { ProfileUpdateCredentials } from 'src/users/dtos/profile-update.dto';
import { Profile, ProfileDocument } from 'src/users/schemas/profile.schema';
import { removeFile } from '../helpers/store-profile-image.helper';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(Profile.name)
    private model: Model<ProfileDocument>,
  ) {}

  async updateProfile(
    user: UserDocument,
    updateDetails: ProfileUpdateCredentials,
  ): Promise<ProfileDocument> {
    const profileExists = await this.model.findOne({ userId: user._id }).exec();

    if (profileExists) {
      return await this.updateExistingProfile(profileExists, updateDetails);
    }

    return await this.createNewProfile(user, updateDetails);
  }

  async updateProfilePhoto(
    user: UserDocument,
    fileName: string,
  ): Promise<ProfileDocument> {
    const userId = user._id;

    const profile = await this.model.findOne({ userId }).exec();

    if (!profile) {
      throw new NotFoundException(PROFILE_ENUMS.NOT_FOUND);
    }

    // remove older profile image file
    if (profile.photoFileName) {
      const profileImagesFolderPath = join(
        process.cwd(),
        'src/images/profiles',
      );
      const fullImagePath = join(
        profileImagesFolderPath + '/' + profile.photoFileName,
      );

      removeFile(fullImagePath);
    }

    const updatedProfile = await this.model
      .findOneAndUpdate(
        { _id: profile._id },
        {
          photoFileName: fileName ?? profile.photoFileName,
          photoUrl: !profile.photoUrl
            ? getFromEnv('BASE_URL') + `/profile/photo`
            : profile.photoUrl,
          updatedAt: new Date(),
        },
      )
      .exec();

    return updatedProfile;
  }

  async getProfile(user: UserDocument): Promise<ProfileDocument> {
    const profile = await this.model.findOne({ userId: user._id });

    if (!profile) {
      return this.createNewProfile(user, {
        fullName: '',
        department: '',
        faculty: '',
      });
    }

    return profile;
  }

  // private functions begin here
  private async updateExistingProfile(
    profile: ProfileDocument,
    updateDetails: ProfileUpdateCredentials,
  ): Promise<ProfileDocument> {
    const updatedProfile = await this.model.findOneAndUpdate(
      { _id: profile._id },
      { ...updateDetails, updatedAt: new Date() },
    );

    if (!updatedProfile) {
      throw new NotFoundException(PROFILE_ENUMS.NOT_FOUND);
    }

    return updatedProfile;
  }

  private async createNewProfile(
    user: UserDocument,
    updateDetails: ProfileUpdateCredentials,
  ): Promise<ProfileDocument> {
    try {
      const { fullName, department, faculty } = updateDetails;

      const profile = await this.model.create({
        userId: user._id,
        fullName: fullName ?? '',
        department: department ?? '',
        faculty: faculty ?? '',
        photoUrl: null,
        photoFileName: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      if (!profile) {
        throw new InternalServerErrorException(PROFILE_ENUMS.UNKNOWN_ERROR);
      }
      return profile;
    } catch (error) {
      console.log(error);

      if (error.code == 11000) {
        if (error.keyPattern?.businessEmail) {
          throw new ConflictException(PROFILE_ENUMS.EMAIL_CONFLICT);
        }
      }

      throw new InternalServerErrorException();
    }
  }
}
