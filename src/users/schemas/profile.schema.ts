import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProfileSchemaInterface } from '../v1/interfaces/profile.interface';

export type ProfileDocument = Profile & Document;

@Schema()
export class Profile implements ProfileSchemaInterface {
  @Prop({ required: true })
  userId: string;

  @Prop()
  fullName: string;

  @Prop()
  department?: string;

  @Prop()
  faculty?: string;

  @Prop({ default: null })
  photoUrl: string | null;

  @Prop({ default: null })
  photoFileName: string | null;

  @Prop({ required: true, default: new Date() })
  createdAt: Date;

  @Prop({ required: true, default: new Date() })
  updatedAt: Date;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
