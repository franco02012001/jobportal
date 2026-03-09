import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FormConfigService, UpsertFormConfigDto } from './form-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/roles.enum';

const JOB_LISTING_KEY = 'job-listing';

@Controller('form-configs')
export class FormConfigController {
  constructor(private readonly formConfigService: FormConfigService) {}

  @Get('job-listing')
  async getJobListingConfig() {
    return this.formConfigService.getByKey(JOB_LISTING_KEY);
  }

  @Put('job-listing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async upsertJobListingConfig(@Body() body: UpsertFormConfigDto) {
    return this.formConfigService.upsertByKey(JOB_LISTING_KEY, body);
  }
}

