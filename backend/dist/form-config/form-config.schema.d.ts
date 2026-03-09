import { Document } from 'mongoose';
export type FormConfigDocument = FormConfig & Document;
export type FormConfigStepFieldType = 'text' | 'textarea' | 'richtext' | 'number' | 'range' | 'email' | 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date' | 'file' | 'link';
export interface FormConfigStepField {
    id: string;
    label: string;
    type: FormConfigStepFieldType;
    required: boolean;
    minSelections?: number;
    options?: string[];
    note?: string;
    reminder?: string;
    placeholder?: string;
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
export declare class FormConfig {
    key: string;
    formTitle: string;
    formDescription: string;
    steps: FormConfigStep[];
}
export declare const FormConfigSchema: import("mongoose").Schema<FormConfig, import("mongoose").Model<FormConfig, any, any, any, Document<unknown, any, FormConfig, any, {}> & FormConfig & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, FormConfig, Document<unknown, {}, import("mongoose").FlatRecord<FormConfig>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<FormConfig> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
