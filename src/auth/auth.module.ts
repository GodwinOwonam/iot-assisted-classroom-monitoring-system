import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthController } from './v1/controllers/auth.controller';
import { AuthRepository } from './v1/repositories/auth.repository';
import { AuthService } from './v1/services/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { JwtStrategy } from './v1/helpers/jwt.strategy';

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
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
