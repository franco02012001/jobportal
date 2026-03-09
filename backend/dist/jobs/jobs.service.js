"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const job_schema_1 = require("./job.schema");
const roles_enum_1 = require("../common/roles.enum");
let JobsService = class JobsService {
    constructor(jobModel) {
        this.jobModel = jobModel;
    }
    async findAll(activeOnly = true) {
        const filter = {};
        if (activeOnly) {
            filter.isActive = true;
        }
        return this.jobModel
            .find(filter)
            .populate('employer', 'name companyName')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id) {
        const job = await this.jobModel
            .findById(id)
            .populate('employer', 'name companyName')
            .exec();
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        return job;
    }
    async create(employerId, dto) {
        const job = await this.jobModel.create({
            ...dto,
            employer: employerId,
            isActive: dto.isActive ?? true,
        });
        return job;
    }
    async update(id, userId, userRole, dto) {
        const job = await this.jobModel.findById(id).exec();
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        const employerId = job.employer?.toString?.() ?? String(job.employer);
        if (userRole !== roles_enum_1.Role.ADMIN && employerId !== userId) {
            throw new common_1.ForbiddenException('Not allowed to update this job');
        }
        Object.assign(job, dto);
        await job.save();
        return job;
    }
    async remove(id, userId, userRole) {
        const job = await this.jobModel.findById(id).exec();
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        const employerId = job.employer?.toString?.() ?? String(job.employer);
        if (userRole !== roles_enum_1.Role.ADMIN && employerId !== userId) {
            throw new common_1.ForbiddenException('Not allowed to delete this job');
        }
        await this.jobModel.deleteOne({ _id: id }).exec();
    }
    async findMyJobs(employerId) {
        return this.jobModel
            .find({ employer: employerId })
            .sort({ createdAt: -1 })
            .exec();
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(job_schema_1.Job.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], JobsService);
//# sourceMappingURL=jobs.service.js.map