import { Model } from 'mongoose';
import { FormConfig, FormConfigDocument } from './form-config.schema';
export interface UpsertFormConfigDto {
    formTitle: string;
    formDescription: string;
    steps: FormConfig['steps'];
}
export declare class FormConfigService {
    private readonly formConfigModel;
    constructor(formConfigModel: Model<FormConfigDocument>);
    getByKey(key: string): Promise<FormConfig>;
    upsertByKey(key: string, dto: UpsertFormConfigDto): Promise<FormConfig>;
}
