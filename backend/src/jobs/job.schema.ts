import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../users/user.schema';

export type JobDocument = Job & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class Job {
  @Prop({ required: false })
  title?: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: false })
  location?: string;

  @Prop({ type: String, required: false })
  salary?: string | null;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  employer: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  /** All field values from Create Job Posting wizard (field id -> value) */
  @Prop({ type: Object, default: () => ({}) })
  formData?: Record<string, string>;
}

export const JobSchema = SchemaFactory.createForClass(Job);

