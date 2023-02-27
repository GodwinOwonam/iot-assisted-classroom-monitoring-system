import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { Profile, ProfileSchema } from './schemas/profile.schema';
import { UsersController } from './v1/controllers/users.controller';
import { UsersRepository } from './v1/repositories/users.repository';
import { UsersService } from './v1/services/users.service';
import * as fs from 'fs';
import * as path from 'path';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => ({
        secret: JSON.parse(
          fs.readFileSync(path.join('.env.stage.dev.json')).toString(),
        ).jwt_secret,
        signOptions: {
          expiresIn: JSON.parse(
            fs.readFileSync(path.join('.env.stage.dev.json')).toString(),
          ).jwt_expiry,
        },
      }),
    }),
    MongooseModule.forFeature([{ name: Profile.name, schema: ProfileSchema }]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
export class UsersModule {}
