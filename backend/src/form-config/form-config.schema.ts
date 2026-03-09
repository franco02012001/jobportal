import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FormConfigDocument = FormConfig & Document;

export type FormConfigStepFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'range'
  | 'email'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'file'
  | 'link';

export interface FormConfigStepField {
  id: string;

  label: string;

  type: FormConfigStepFieldType;

  required: boolean;

  /**
   * Minimum number of selections required (for multiselect). Default 1.
   */
  minSelections?: number;

  /**
   * Optional list of choices for select, multiselect, checkbox, and radio fields.
   */
  options?: string[];

  /**
   * Optional helper text shown below the field in a subtle color.
   */
  note?: string;

  /**
   * Optional important reminder shown below the field in red.
   */
  reminder?: string;

  /**
   * Optional placeholder text for the input.
   */
  placeholder?: string;

  /**
   * Optional nested sub fields that conceptually belong to this field.
   * Used to model grouped inputs (e.g. a select with additional sub-fields).
   */
  subFields?: FormConfigStepField[];
}

export interface FormConfigStep {
  id: string;

  name: string;

  primaryLabel: string;

  secondaryLabel: string;

  visible: boolean;

  fields: FormConfigStepField[];
}

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
export class FormConfig {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  formTitle: string;

  @Prop({ required: true })
  formDescription: string;

  @Prop({ type: Array, default: [] })
  steps: FormConfigStep[];
}

export const FormConfigSchema = SchemaFactory.createForClass(FormConfig);

