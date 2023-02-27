import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserSchemaInterface } from '../v1/interfaces/user.interface';

export type UserDocument = User & Document;

@Schema()
export class User implements UserSchemaInterface {
  @Prop({ required: true, unique: true, type: String })
  username: string;

  @Prop({ required: true, unique: true, type: String })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, default: false })
  requiresLogin: boolean;

  @Prop({ required: true, default: new Date() })
  createdAt: Date;

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
