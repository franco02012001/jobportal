import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../common/roles.enum';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../users/user.schema';

@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Get()
  findAll(@Query('all') all?: string) {
    return this.jobsService.findAll(all !== 'true');
  }

  @Get('my/list')
  @UseGuards(JwtAuthGuard)
  myJobs(@CurrentUser() user: User) {
    const u: any = user as any;
    const userId = u.id ?? u._id?.toString();
    return this.jobsService.findMyJobs(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    const u: any = user as any;
    const userId = u.id ?? u._id?.toString();
    return this.jobsService.create(userId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.EMPLOYEE, Role.ADMIN)
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateJobDto,
  ) {
    const u: any = user as any;
    const userId = u.id ?? u._id?.toString();
    return this.jobsService.update(id, userId, user.role as Role, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.EMPLOYEE, Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    const u: any = user as any;
    const userId = u.id ?? u._id?.toString();
    return this.jobsService.remove(id, userId, user.role as Role);
  }
}
