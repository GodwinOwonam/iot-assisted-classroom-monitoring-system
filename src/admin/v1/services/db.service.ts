import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { AUTH_ENUM } from 'src/auth/v1/constants/enums/auth-enums';
import { AuthRepository } from 'src/auth/v1/repositories/auth.repository';
import { deletableCollections } from 'src/helpers/db.helper';
import { getFromEnv } from 'src/helpers/env.helper';
import { IResponse } from 'src/interfaces/response.interface';
import { UsersRepository } from 'src/users/v1/repositories/users.repository';
import { DB_MGT_ERROR_ENUM, DB_MGT_MESSAGE_ENUM } from '../constants/db.enums';

@Injectable()
export class DbService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async dropCollection(
    collectionDto: {
      collection: string;
      proceed: string;
    },
    admin: UserDocument,
  ): Promise<IResponse | any> {
    if (!admin) {
      throw new UnauthorizedException(AUTH_ENUM.UNAUTHORIZED);
    }

    const { collection, proceed } = collectionDto;

    if (!deletableCollections.includes(collection)) {
      throw new UnauthorizedException(
        DB_MGT_ERROR_ENUM.UNAUTHORIZED_COLLECTION_DELETE,
      );
    }
    if (!proceed || proceed !== collection) {
      throw new UnauthorizedException(DB_MGT_ERROR_ENUM.MISSING_CONFIRMATION);
    }
    await this.dropDbCollection(collection, admin);

    return {
      success: true,
      message: DB_MGT_MESSAGE_ENUM.DB_COLLECTION_DROP_SUCCESS,
    };
  }

  async dropDatabase(
    collectionDto: { proceed: string },
    admin: UserDocument,
  ): Promise<any> {
    if (!admin) {
      throw new UnauthorizedException(AUTH_ENUM.UNAUTHORIZED);
    }

    const { proceed } = collectionDto;

    if (!proceed || proceed !== 'yes') {
      throw new UnauthorizedException(DB_MGT_ERROR_ENUM.MISSING_CONFIRMATION);
    }

    await this.dropAllCollections(admin);

    return {
      success: true,
      message: DB_MGT_MESSAGE_ENUM.DB_DATABASE_DROP_SUCCESS,
    };
  }

  private async dropDbCollection(
    collectionName: string,
    admin: UserDocument,
  ): Promise<any> {
    switch (collectionName) {
      case 'users':
        await this.authRepository.invalidateUser(admin);
        await this.authRepository.deleteAllUsers();
        await this.usersRepository.deleteAllProfiles();
        await this.recreateSuperAdmin();
        break;
      case 'profiles':
        await this.usersRepository.deleteAllProfiles();
        break;
    }
  }

  private async dropAllCollections(admin: UserDocument): Promise<any> {
    await this.authRepository.invalidateUser(admin);

    await this.authRepository.deleteAllUsers();
    await this.usersRepository.deleteAllProfiles();

    await this.recreateSuperAdmin();
  }

  private async recreateSuperAdmin(): Promise<any> {
    return await this.authRepository.createSuperAdmin({
      username: getFromEnv('super_admin_username'),
      email: getFromEnv('super_admin_email'),
      password: getFromEnv('super_admin_password'),
      confirmPassword: getFromEnv('super_admin_password'),
    });
  }
}
