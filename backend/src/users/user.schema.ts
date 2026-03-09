import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

const ProfessionalInfoSchema = new MongooseSchema(
  {
    title: { type: String, required: true },
    organization: { type: String, required: true },
    startDate: { type: String, required: false },
    endDate: { type: String, required: false },
    description: { type: String, required: false },
  },
  { _id: true },
);

export interface SocialLinkEntry {
  id?: string;
  label: string;
  url: string;
}

const SocialLinkSchema = new MongooseSchema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: true },
);

export interface SkillEntry {
  id?: string;
  skills?: string;
  skillLevel?: string | null;
  /** @deprecated use skills */
  primarySkills?: string | null;
  secondarySkills?: string | null;
  softSkills?: string | null;
}

const SkillSchema = new MongooseSchema(
  {
    skills: { type: String, required: false },
    skillLevel: { type: String, required: false },
    primarySkills: { type: String, required: false },
    secondarySkills: { type: String, required: false },
    softSkills: { type: String, required: false },
  },
  { _id: true },
);

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

const EducationSchema = new MongooseSchema(
  {
    schoolUniversity: { type: String, required: true },
    degree: { type: String, required: false },
    fieldOfStudy: { type: String, required: false },
    startYear: { type: String, required: false },
    endYear: { type: String, required: false },
    gpa: { type: String, required: false },
    honorsAwards: { type: String, required: false },
  },
  { _id: true },
);

export interface CertificationEntry {
  id?: string;
  certificationName: string;
  issuingOrganization?: string | null;
  issueDate?: string | null;
  expirationDate?: string | null;
  credentialId?: string | null;
  certificateUrl?: string | null;
}

const CertificationSchema = new MongooseSchema(
  {
    certificationName: { type: String, required: true },
    issuingOrganization: { type: String, required: false },
    issueDate: { type: String, required: false },
    expirationDate: { type: String, required: false },
    credentialId: { type: String, required: false },
    certificateUrl: { type: String, required: false },
  },
  { _id: true },
);

export interface ProjectEntry {
  id?: string;
  projectName: string;
  projectDescription?: string | null;
  technologiesUsed?: string | null;
  projectLink?: string | null;
  repository?: string | null;
  demoScreenshotsUrl?: string | null;
}

const ProjectSchema = new MongooseSchema(
  {
    projectName: { type: String, required: true },
    projectDescription: { type: String, required: false },
    technologiesUsed: { type: String, required: false },
    projectLink: { type: String, required: false },
    repository: { type: String, required: false },
    demoScreenshotsUrl: { type: String, required: false },
  },
  { _id: true },
);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      if (Array.isArray(ret.professionalInfo)) {
        ret.professionalInfo = ret.professionalInfo.map((entry: any) => {
          const e = { ...entry };
          if (e._id) {
            e.id = e._id.toString();
            delete e._id;
          }
          return e;
        });
      }
      if (Array.isArray(ret.socialLinks)) {
        ret.socialLinks = ret.socialLinks.map((entry: any) => {
          const e = { ...entry };
          if (e._id) {
            e.id = e._id.toString();
            delete e._id;
          }
          return e;
        });
      }
      if (Array.isArray(ret.skills)) {
        ret.skills = ret.skills.map((entry: any) => {
          const e = { ...entry };
          if (e._id) {
            e.id = e._id.toString();
            delete e._id;
          }
          return e;
        });
      }
      if (Array.isArray(ret.education)) {
        ret.education = ret.education.map((entry: any) => {
          const e = { ...entry };
          if (e._id) {
            e.id = e._id.toString();
            delete e._id;
          }
          return e;
        });
      }
      if (Array.isArray(ret.certifications)) {
        ret.certifications = ret.certifications.map((entry: any) => {
          const e = { ...entry };
          if (e._id) {
            e.id = e._id.toString();
            delete e._id;
          }
          return e;
        });
      }
      if (Array.isArray(ret.projects)) {
        ret.projects = ret.projects.map((entry: any) => {
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
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: Object.values(Role), default: Role.EMPLOYEE })
  role: Role;

  @Prop({ type: String, required: false })
  companyName?: string | null;

  // Profile
  @Prop({ type: String, required: false })
  coverPictureUrl?: string | null;

  @Prop({ type: String, required: false })
  profilePictureUrl?: string | null;

  @Prop({ type: String, required: false })
  firstName?: string | null;

  @Prop({ type: String, required: false })
  middleName?: string | null;

  @Prop({ type: String, required: false })
  lastName?: string | null;

  @Prop({ type: String, required: false })
  suffix?: string | null;

  @Prop({ type: String, required: false })
  gender?: string | null;

  @Prop({ type: Date, required: false })
  dateOfBirth?: Date | null;

  @Prop({ type: String, required: false })
  pronoun?: string | null;

  @Prop({ type: String, required: false })
  bio?: string | null;

  @Prop({ type: String, required: false })
  nationality?: string | null;

  @Prop({ type: String, required: false })
  civilStatus?: string | null;

  @Prop({ type: String, required: false })
  schoolGraduated?: string | null;

  @Prop({ type: String, required: false })
  city?: string | null;

  @Prop({ type: String, required: false })
  provinceState?: string | null;

  @Prop({ type: String, required: false })
  country?: string | null;

  @Prop({ type: String, required: false })
  streetAddress?: string | null;

  @Prop({ type: String, required: false })
  houseNumber?: string | null;

  @Prop({ type: String, required: false })
  postalCode?: string | null;

  @Prop({ type: String, required: false })
  taxId?: string | null;

  @Prop({ type: String, required: false })
  position?: string | null;

  @Prop({ type: String, required: false })
  phone?: string | null;

  @Prop({ type: String, required: false })
  mobileNumber?: string | null;

  @Prop({ type: String, required: false })
  linkedinUrl?: string | null;

  @Prop({ type: String, required: false })
  githubUrl?: string | null;

  @Prop({ type: String, required: false })
  twitterUrl?: string | null;

  @Prop({ type: String, required: false })
  websiteUrl?: string | null;

  @Prop({ type: String, required: false })
  otherSocialUrl?: string | null;

  @Prop({ type: String, required: false })
  resumeUrl?: string | null;

  @Prop({ type: String, required: false })
  coverLetterUrl?: string | null;

  @Prop({ type: String, required: false })
  desiredJobTitle?: string | null;

  @Prop({ type: String, required: false })
  jobCategory?: string | null;

  @Prop({ type: String, required: false })
  preferredIndustry?: string | null;

  @Prop({ type: String, required: false })
  employmentType?: string | null;

  @Prop({ type: String, required: false })
  workSetup?: string | null;

  @Prop({ type: String, required: false })
  expectedSalary?: string | null;

  @Prop({ type: String, required: false })
  availableStart?: string | null;

  @Prop({ type: Boolean, required: false })
  willingToRelocate?: boolean | null;

  @Prop({ type: String, required: false })
  availabilityStatus?: string | null;

  @Prop({ type: String, required: false })
  noticePeriod?: string | null;

  @Prop({ type: [String], default: [] })
  openTo?: string[];

  @Prop({ type: String, enum: ['public', 'private'], default: 'public' })
  profileVisibility?: 'public' | 'private';

  @Prop({ type: [ProfessionalInfoSchema], default: [] })
  professionalInfo?: ProfessionalInfoEntry[];

  @Prop({ type: [SocialLinkSchema], default: [] })
  socialLinks?: SocialLinkEntry[];

  @Prop({ type: [SkillSchema], default: [] })
  skills?: SkillEntry[];

  @Prop({ type: [EducationSchema], default: [] })
  education?: EducationEntry[];

  @Prop({ type: [CertificationSchema], default: [] })
  certifications?: CertificationEntry[];

  @Prop({ type: [ProjectSchema], default: [] })
  projects?: ProjectEntry[];
}

export const UserSchema = SchemaFactory.createForClass(User);

