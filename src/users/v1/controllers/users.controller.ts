import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { GetUser } from 'src/auth/v1/decorators/get-user.decorator';
import { IResponse } from 'src/interfaces/response.interface';
import { ProfileUpdateCredentials } from 'src/users/dtos/profile-update.dto';
import { saveProfileImageToStorage } from '../helpers/store-profile-image.helper';
import { UsersService } from '../services/users.service';

@UseGuards(AuthGuard())
@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  async viewProfile(@GetUser() user: UserDocument): Promise<IResponse> {
    return await this.usersService.viewProfile(user);
  }

  @Post('')
  async updateProfile(
    @GetUser() user: UserDocument,
    @Body() updateProfileDto: ProfileUpdateCredentials,
  ): Promise<IResponse> {
    return await this.usersService.updateProfile(updateProfileDto, user);
  }

  @Post('/photo')
  @UseInterceptors(FileInterceptor('photo', saveProfileImageToStorage))
  async uploadProfilePhoto(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: UserDocument,
  ): Promise<any> {
    // console.log(file);
    // console.log(req);

    return await this.usersService.updateProfilePhoto(file, user);
  }

  @Get('/photo')
  async getProfilePhoto(
    @Res() res,
    @GetUser() user: UserDocument,
  ): Promise<IResponse> {
    return await this.usersService.viewProfilePhoto(res, user);
  }
}
