import { FormConfigService, UpsertFormConfigDto } from './form-config.service';
export declare class FormConfigController {
    private readonly formConfigService;
    constructor(formConfigService: FormConfigService);
    getJobListingConfig(): Promise<import("./form-config.schema").FormConfig>;
    upsertJobListingConfig(body: UpsertFormConfigDto): Promise<import("./form-config.schema").FormConfig>;
}
