import { Document, Schema as MongooseSchema } from 'mongoose';
import { Role } from '../common/roles.enum';
export type UserDocument = User & Document;
export interface ProfessionalInfoEntry {
    id?: string;
    title: string;
    organization: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
}
export interface SocialLinkEntry {
    id?: string;
    label: string;
    url: string;
}
export interface SkillEntry {
    id?: string;
    skills?: string;
    skillLevel?: string | null;
    primarySkills?: string | null;
    secondarySkills?: string | null;
    softSkills?: string | null;
}
export interface EducationEntry {
    id?: string;
    schoolUniversity: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startYear?: string | null;
    endYear?: string | null;
    gpa?: string | null;
    honorsAwards?: string | null;
}
export interface CertificationEntry {
    id?: string;
    certificationName: string;
    issuingOrganization?: string | null;
    issueDate?: string | null;
    expirationDate?: string | null;
    credentialId?: string | null;
    certificateUrl?: string | null;
}
export interface ProjectEntry {
    id?: string;
    projectName: string;
    projectDescription?: string | null;
    technologiesUsed?: string | null;
    projectLink?: string | null;
    repository?: string | null;
    demoScreenshotsUrl?: string | null;
}
export declare class User {
    email: string;
    password: string;
    name: string;
    role: Role;
    companyName?: string | null;
    coverPictureUrl?: string | null;
    profilePictureUrl?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
    suffix?: string | null;
    gender?: string | null;
    dateOfBirth?: Date | null;
    pronoun?: string | null;
    bio?: string | null;
    nationality?: string | null;
    civilStatus?: string | null;
    schoolGraduated?: string | null;
    city?: string | null;
    provinceState?: string | null;
    country?: string | null;
    streetAddress?: string | null;
    houseNumber?: string | null;
    postalCode?: string | null;
    taxId?: string | null;
    position?: string | null;
    phone?: string | null;
    mobileNumber?: string | null;
    linkedinUrl?: string | null;
    githubUrl?: string | null;
    twitterUrl?: string | null;
    websiteUrl?: string | null;
    otherSocialUrl?: string | null;
    resumeUrl?: string | null;
    coverLetterUrl?: string | null;
    desiredJobTitle?: string | null;
    jobCategory?: string | null;
    preferredIndustry?: string | null;
    employmentType?: string | null;
    workSetup?: string | null;
    expectedSalary?: string | null;
    availableStart?: string | null;
    willingToRelocate?: boolean | null;
    availabilityStatus?: string | null;
    noticePeriod?: string | null;
    openTo?: string[];
    profileVisibility?: 'public' | 'private';
    professionalInfo?: ProfessionalInfoEntry[];
    socialLinks?: SocialLinkEntry[];
    skills?: SkillEntry[];
    education?: EducationEntry[];
    certifications?: CertificationEntry[];
    projects?: ProjectEntry[];
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
