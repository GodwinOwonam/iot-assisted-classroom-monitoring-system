import { Module } from '@nestjs/common';
import { UsersController } from './v1/controllers/users.controller';

@Module({
  controllers: [UsersController],
})
export class AdminModule {}
