import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const getFromEnv = (key: string) => {
  try {
    const env = process.env.STAGE;
    return JSON.parse(
      fs.readFileSync(path.join(`.env.stage.${env}.json`)).toString(),
    )[key];
  } catch (error) {
    throw new InternalServerErrorException(error.message);
  }
};
