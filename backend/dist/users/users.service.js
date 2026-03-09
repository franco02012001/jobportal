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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const user_schema_1 = require("./user.schema");
const roles_enum_1 = require("../common/roles.enum");
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_DOC_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_DOC_SIZE = 10 * 1024 * 1024;
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async onModuleInit() {
        const existingAdmin = await this.userModel.findOne({ role: roles_enum_1.Role.ADMIN });
        if (!existingAdmin) {
            const email = process.env.ADMIN_EMAIL || 'admin@example.com';
            const password = process.env.ADMIN_PASSWORD || 'admin123';
            const hashed = await bcrypt.hash(password, 10);
            await this.userModel.create({
                email,
                password: hashed,
                name: 'Admin',
                role: roles_enum_1.Role.ADMIN,
            });
            console.log('Seeded admin user:', email);
        }
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
    async create(data) {
        const existing = await this.findByEmail(data.email);
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const user = await this.userModel.create(data);
        return user;
    }
    async updateProfile(id, data) {
        const toUpdate = {};
        const keys = [
            'name', 'companyName', 'coverPictureUrl', 'profilePictureUrl',
            'firstName', 'middleName', 'lastName', 'suffix', 'gender', 'dateOfBirth',
            'pronoun', 'bio', 'nationality', 'civilStatus', 'schoolGraduated', 'city', 'provinceState', 'country',
            'streetAddress', 'houseNumber', 'postalCode', 'taxId', 'position', 'phone', 'mobileNumber',
            'linkedinUrl', 'githubUrl', 'twitterUrl', 'websiteUrl', 'otherSocialUrl',
            'resumeUrl', 'coverLetterUrl',
            'desiredJobTitle', 'jobCategory', 'preferredIndustry', 'employmentType', 'workSetup', 'expectedSalary', 'availableStart', 'willingToRelocate',
            'availabilityStatus', 'noticePeriod', 'profileVisibility',
        ];
        for (const key of keys) {
            if (data[key] !== undefined) {
                const val = data[key];
                if (key === 'dateOfBirth') {
                    toUpdate[key] = val === '' || val == null ? null : new Date(val);
                }
                else if (key === 'willingToRelocate') {
                    toUpdate[key] = val === true || val === 'true' ? true : val === false || val === 'false' ? false : null;
                }
                else {
                    toUpdate[key] = val === '' ? null : val;
                }
            }
        }
        if (data.openTo !== undefined) {
            toUpdate.openTo = Array.isArray(data.openTo) ? data.openTo.filter((s) => typeof s === 'string' && s.trim() !== '') : [];
        }
        if (data.professionalInfo !== undefined) {
            toUpdate.professionalInfo = data.professionalInfo.map((e) => ({
                title: e.title ?? '',
                organization: e.organization ?? '',
                startDate: e.startDate === '' ? null : e.startDate ?? null,
                endDate: e.endDate === '' ? null : e.endDate ?? null,
                description: e.description === '' ? null : e.description ?? null,
            }));
        }
        if (data.socialLinks !== undefined) {
            toUpdate.socialLinks = data.socialLinks.map((e) => ({
                label: e.label ?? '',
                url: e.url ?? '',
            }));
        }
        if (data.skills !== undefined) {
            toUpdate.skills = data.skills.map((e) => ({
                skills: e.skills ?? '',
                skillLevel: e.skillLevel === '' ? null : e.skillLevel ?? null,
            }));
        }
        if (data.education !== undefined) {
            toUpdate.education = data.education.map((e) => ({
                schoolUniversity: e.schoolUniversity ?? '',
                degree: e.degree === '' ? null : e.degree ?? null,
                fieldOfStudy: e.fieldOfStudy === '' ? null : e.fieldOfStudy ?? null,
                startYear: e.startYear === '' ? null : e.startYear ?? null,
                endYear: e.endYear === '' ? null : e.endYear ?? null,
                gpa: e.gpa === '' ? null : e.gpa ?? null,
                honorsAwards: e.honorsAwards === '' ? null : e.honorsAwards ?? null,
            }));
        }
        if (data.certifications !== undefined) {
            toUpdate.certifications = data.certifications.map((e) => ({
                certificationName: e.certificationName ?? '',
                issuingOrganization: e.issuingOrganization === '' ? null : e.issuingOrganization ?? null,
                issueDate: e.issueDate === '' ? null : e.issueDate ?? null,
                expirationDate: e.expirationDate === '' ? null : e.expirationDate ?? null,
                credentialId: e.credentialId === '' ? null : e.credentialId ?? null,
                certificateUrl: e.certificateUrl === '' ? null : e.certificateUrl ?? null,
            }));
        }
        if (data.projects !== undefined) {
            toUpdate.projects = data.projects.map((e) => ({
                projectName: e.projectName ?? '',
                projectDescription: e.projectDescription === '' ? null : e.projectDescription ?? null,
                technologiesUsed: e.technologiesUsed === '' ? null : e.technologiesUsed ?? null,
                projectLink: e.projectLink === '' ? null : e.projectLink ?? null,
                repository: e.repository === '' ? null : e.repository ?? null,
                demoScreenshotsUrl: e.demoScreenshotsUrl === '' ? null : e.demoScreenshotsUrl ?? null,
            }));
        }
        const user = await this.userModel
            .findByIdAndUpdate(id, { $set: toUpdate }, { new: true })
            .exec();
        return user;
    }
    async uploadAvatar(id, file, baseUrl) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
        }
        if (file.size > MAX_SIZE) {
            throw new common_1.BadRequestException('File too large. Maximum size is 5MB.');
        }
        const dir = 'uploads/avatars';
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const ext = (0, path_1.extname)(file.originalname) || '.jpg';
        const safeExt = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : '.jpg';
        const filename = `${id}-${Date.now()}${safeExt}`;
        const filepath = `${dir}/${filename}`;
        await (0, promises_1.writeFile)(filepath, file.buffer);
        const url = `${baseUrl.replace(/\/$/, '')}/uploads/avatars/${filename}`;
        return this.updateProfile(id, { profilePictureUrl: url });
    }
    async uploadResume(id, file, baseUrl) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Use PDF or Word (DOC/DOCX).');
        }
        if (file.size > MAX_DOC_SIZE) {
            throw new common_1.BadRequestException('File too large. Maximum size is 10MB.');
        }
        const dir = 'uploads/documents';
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const ext = (0, path_1.extname)(file.originalname) || '.pdf';
        const safeExt = /^\.(pdf|doc|docx)$/i.test(ext) ? ext : '.pdf';
        const filename = `${id}-resume-${Date.now()}${safeExt}`;
        const filepath = `${dir}/${filename}`;
        await (0, promises_1.writeFile)(filepath, file.buffer);
        const url = `${baseUrl.replace(/\/$/, '')}/uploads/documents/${filename}`;
        return this.updateProfile(id, { resumeUrl: url });
    }
    async uploadCoverLetter(id, file, baseUrl) {
        if (!file || !file.buffer) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Use PDF or Word (DOC/DOCX).');
        }
        if (file.size > MAX_DOC_SIZE) {
            throw new common_1.BadRequestException('File too large. Maximum size is 10MB.');
        }
        const dir = 'uploads/documents';
        await (0, promises_1.mkdir)(dir, { recursive: true });
        const ext = (0, path_1.extname)(file.originalname) || '.pdf';
        const safeExt = /^\.(pdf|doc|docx)$/i.test(ext) ? ext : '.pdf';
        const filename = `${id}-cover-${Date.now()}${safeExt}`;
        const filepath = `${dir}/${filename}`;
        await (0, promises_1.writeFile)(filepath, file.buffer);
        const url = `${baseUrl.replace(/\/$/, '')}/uploads/documents/${filename}`;
        return this.updateProfile(id, { coverLetterUrl: url });
    }
    async changePassword(id, currentPassword, newPassword) {
        const user = await this.userModel.findById(id).select('password').exec();
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const doc = user;
        const match = await bcrypt.compare(currentPassword, doc.password);
        if (!match)
            throw new common_1.UnauthorizedException('Current password is incorrect');
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.userModel.findByIdAndUpdate(id, { $set: { password: hashed } }).exec();
    }
    async deleteMe(id) {
        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0)
            throw new common_1.BadRequestException('User not found');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map