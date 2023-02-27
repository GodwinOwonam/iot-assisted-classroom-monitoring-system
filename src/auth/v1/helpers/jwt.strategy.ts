import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_ENUM } from '../constants/enums/auth-enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private readonly model: Model<UserDocument>,
  ) {
    super({
      secretOrKey: JSON.parse(
        fs.readFileSync(path.join('.env.stage.dev.json')).toString(),
      ).jwt_secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: IJwtPayload): Promise<UserDocument> {
    const { username } = payload;
    const user = await this.model.findOne({ username }).exec();

    if (!user || user.requiresLogin == true) {
      throw new UnauthorizedException(AUTH_ENUM.UNAUTHORIZED);
    }

    return user;
  }
}
