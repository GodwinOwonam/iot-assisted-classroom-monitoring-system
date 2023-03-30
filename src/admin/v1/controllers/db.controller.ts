import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDocument } from 'src/auth/schemas/user.schema';
import { GetAdmin } from 'src/auth/v1/decorators/get-admin.decorator';
import { DbService } from '../services/db.service';

@UseGuards(AuthGuard())
@Controller('sys-db')
export class DbController {
  constructor(private readonly dbService: DbService) {}

  @Post('/drop-one')
  async dropCollection(
    @Body() collectionDto: { collection: string; proceed: string },
    @GetAdmin() admin: UserDocument,
  ): Promise<any> {
    return this.dbService.dropCollection(collectionDto, admin);
  }

  @Post('/drop')
  async dropDatabase(
    @Body() collectionDto: { proceed: string },
    @GetAdmin() admin: UserDocument,
  ): Promise<any> {
    return await this.dbService.dropDatabase(collectionDto, admin);
  }
}
