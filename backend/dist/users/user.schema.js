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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const roles_enum_1 = require("../common/roles.enum");
const ProfessionalInfoSchema = new mongoose_2.Schema({
    title: { type: String, required: true },
    organization: { type: String, required: true },
    startDate: { type: String, required: false },
    endDate: { type: String, required: false },
    description: { type: String, required: false },
}, { _id: true });
const SocialLinkSchema = new mongoose_2.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: true });
const SkillSchema = new mongoose_2.Schema({
    skills: { type: String, required: false },
    skillLevel: { type: String, required: false },
    primarySkills: { type: String, required: false },
    secondarySkills: { type: String, required: false },
    softSkills: { type: String, required: false },
}, { _id: true });
const EducationSchema = new mongoose_2.Schema({
    schoolUniversity: { type: String, required: true },
    degree: { type: String, required: false },
    fieldOfStudy: { type: String, required: false },
    startYear: { type: String, required: false },
    endYear: { type: String, required: false },
    gpa: { type: String, required: false },
    honorsAwards: { type: String, required: false },
}, { _id: true });
const CertificationSchema = new mongoose_2.Schema({
    certificationName: { type: String, required: true },
    issuingOrganization: { type: String, required: false },
    issueDate: { type: String, required: false },
    expirationDate: { type: String, required: false },
    credentialId: { type: String, required: false },
    certificateUrl: { type: String, required: false },
}, { _id: true });
const ProjectSchema = new mongoose_2.Schema({
    projectName: { type: String, required: true },
    projectDescription: { type: String, required: false },
    technologiesUsed: { type: String, required: false },
    projectLink: { type: String, required: false },
    repository: { type: String, required: false },
    demoScreenshotsUrl: { type: String, required: false },
}, { _id: true });
let User = class User {
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ unique: true, required: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(roles_enum_1.Role), default: roles_enum_1.Role.EMPLOYEE }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "companyName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "coverPictureUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "profilePictureUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "firstName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "middleName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "lastName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "suffix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "gender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: false }),
    __metadata("design:type", Object)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "pronoun", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "bio", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "nationality", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "civilStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "schoolGraduated", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "provinceState", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "streetAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "houseNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "postalCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "taxId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "position", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "mobileNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "linkedinUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "githubUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "twitterUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "websiteUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "otherSocialUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "resumeUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "coverLetterUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "desiredJobTitle", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "jobCategory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "preferredIndustry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "employmentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "workSetup", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "expectedSalary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "availableStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, required: false }),
    __metadata("design:type", Object)
], User.prototype, "willingToRelocate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "availabilityStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: false }),
    __metadata("design:type", Object)
], User.prototype, "noticePeriod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "openTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['public', 'private'], default: 'public' }),
    __metadata("design:type", String)
], User.prototype, "profileVisibility", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ProfessionalInfoSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "professionalInfo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SocialLinkSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "socialLinks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [SkillSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "skills", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [EducationSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "education", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [CertificationSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "certifications", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [ProjectSchema], default: [] }),
    __metadata("design:type", Array)
], User.prototype, "projects", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                if (Array.isArray(ret.professionalInfo)) {
                    ret.professionalInfo = ret.professionalInfo.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                if (Array.isArray(ret.socialLinks)) {
                    ret.socialLinks = ret.socialLinks.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                if (Array.isArray(ret.skills)) {
                    ret.skills = ret.skills.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                if (Array.isArray(ret.education)) {
                    ret.education = ret.education.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                if (Array.isArray(ret.certifications)) {
                    ret.certifications = ret.certifications.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                if (Array.isArray(ret.projects)) {
                    ret.projects = ret.projects.map((entry) => {
                        const e = { ...entry };
                        if (e._id) {
                            e.id = e._id.toString();
                            delete e._id;
                        }
                        return e;
                    });
                }
                return ret;
            },
        },
    })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
//# sourceMappingURL=user.schema.js.map