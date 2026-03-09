import { Document, Types } from 'mongoose';
export type JobDocument = Job & Document;
export declare class Job {
    title?: string;
    description: string;
    location?: string;
    salary?: string | null;
    employer: Types.ObjectId;
    isActive: boolean;
    formData?: Record<string, string>;
}
export declare const JobSchema: import("mongoose").Schema<Job, import("mongoose").Model<Job, any, any, any, Document<unknown, any, Job, any, {}> & Job & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Job, Document<unknown, {}, import("mongoose").FlatRecord<Job>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Job> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
