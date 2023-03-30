import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as path from 'path';
import * as fs from 'fs';
import { AuthModule } from 'src/auth/auth.module';
import { DbController } from './v1/controllers/db.controller';
import { UsersController } from './v1/controllers/users.controller';
import { getFromEnv } from 'src/helpers/env.helper';
import { DbService } from './v1/services/db.service';
import { UsersModule } from 'src/users/users.module';
import { AuthRepository } from 'src/auth/v1/repositories/auth.repository';
import { UsersRepository } from 'src/users/v1/repositories/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Profile, ProfileSchema } from 'src/users/schemas/profile.schema';
import { User, UserSchema } from 'src/auth/schemas/user.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        secret: getFromEnv('jwt_secret'),
        signOptions: {
          expiresIn: getFromEnv('jwt_expiry'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Profile.name, schema: ProfileSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    UsersModule,
  ],
  controllers: [UsersController, DbController],
  providers: [DbService, AuthRepository, UsersRepository],
})
export class AdminModule {}
