import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { User } from '../users/user.schema';
export declare class JobsController {
    private jobsService;
    constructor(jobsService: JobsService);
    findAll(all?: string): Promise<import("./job.schema").Job[]>;
    myJobs(user: User): Promise<import("./job.schema").Job[]>;
    findOne(id: string): Promise<import("./job.schema").Job>;
    create(user: User, dto: CreateJobDto): Promise<import("./job.schema").Job>;
    update(id: string, user: User, dto: UpdateJobDto): Promise<import("./job.schema").Job>;
    remove(id: string, user: User): Promise<void>;
}
