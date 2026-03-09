import { Model } from 'mongoose';
import { Job, JobDocument } from './job.schema';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Role } from '../common/roles.enum';
export declare class JobsService {
    private readonly jobModel;
    constructor(jobModel: Model<JobDocument>);
    findAll(activeOnly?: boolean): Promise<Job[]>;
    findOne(id: string): Promise<Job>;
    create(employerId: string, dto: CreateJobDto): Promise<Job>;
    update(id: string, userId: string, userRole: Role, dto: UpdateJobDto): Promise<Job>;
    remove(id: string, userId: string, userRole: Role): Promise<void>;
    findMyJobs(employerId: string): Promise<Job[]>;
}
