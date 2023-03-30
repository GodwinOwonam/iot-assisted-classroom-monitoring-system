import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from 'src/auth/schemas/user.schema';

export const GetAdmin = createParamDecorator(
  (_data, ctx: ExecutionContext): UserDocument => {
    const req = ctx.switchToHttp().getRequest();

    return req.user.isAdmin ? req.user : null;
  },
);
