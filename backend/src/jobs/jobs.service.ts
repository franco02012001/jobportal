import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from './job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Role } from '../common/roles.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
  ) {}

  async findAll(activeOnly = true): Promise<Job[]> {
    const filter: Record<string, unknown> = {};
    if (activeOnly) {
      filter.isActive = true;
    }
    return this.jobModel
      .find(filter)
      .populate('employer', 'name companyName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Job> {
    const job = await this.jobModel
      .findById(id)
      .populate('employer', 'name companyName')
      .exec();
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(employerId: string, dto: CreateJobDto): Promise<Job> {
    const job = await this.jobModel.create({
      ...dto,
      employer: employerId,
      isActive: dto.isActive ?? true,
    });
    return job;
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateJobDto,
  ): Promise<Job> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) throw new NotFoundException('Job not found');
    const employerId = job.employer?.toString?.() ?? String(job.employer);
    if (userRole !== Role.ADMIN && employerId !== userId) {
      throw new ForbiddenException('Not allowed to update this job');
    }
    Object.assign(job, dto);
    await job.save();
    return job;
  }

  async remove(id: string, userId: string, userRole: Role): Promise<void> {
    const job = await this.jobModel.findById(id).exec();
    if (!job) throw new NotFoundException('Job not found');
    const employerId = job.employer?.toString?.() ?? String(job.employer);
    if (userRole !== Role.ADMIN && employerId !== userId) {
      throw new ForbiddenException('Not allowed to delete this job');
    }
    await this.jobModel.deleteOne({ _id: id }).exec();
  }

  async findMyJobs(employerId: string): Promise<Job[]> {
    return this.jobModel
      .find({ employer: employerId })
      .sort({ createdAt: -1 })
      .exec();
  }
}
