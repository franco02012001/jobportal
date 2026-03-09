import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FormConfig, FormConfigDocument } from './form-config.schema';

export interface UpsertFormConfigDto {
  formTitle: string;
  formDescription: string;
  steps: FormConfig['steps'];
}

@Injectable()
export class FormConfigService {
  constructor(
    @InjectModel(FormConfig.name)
    private readonly formConfigModel: Model<FormConfigDocument>,
  ) {}

  async getByKey(key: string): Promise<FormConfig> {
    const existing = await this.formConfigModel.findOne({ key }).lean<FormConfig>().exec();
    if (!existing) {
      throw new NotFoundException(`Form configuration with key "${key}" not found`);
    }
    return existing;
  }

  async upsertByKey(key: string, dto: UpsertFormConfigDto): Promise<FormConfig> {
    const updated = await this.formConfigModel
      .findOneAndUpdate(
        { key },
        {
          key,
          formTitle: dto.formTitle,
          formDescription: dto.formDescription,
          steps: dto.steps ?? [],
        },
        {
          new: true,
          upsert: true,
        },
      )
      .lean<FormConfig>()
      .exec();

    return updated;
  }
}

