import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormConfig, FormConfigSchema } from './form-config.schema';
import { FormConfigService } from './form-config.service';
import { FormConfigController } from './form-config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: FormConfig.name, schema: FormConfigSchema }]),
  ],
  controllers: [FormConfigController],
  providers: [FormConfigService],
  exports: [FormConfigService],
})
export class FormConfigModule {}

