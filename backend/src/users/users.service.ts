import { BadRequestException, ConflictException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { mkdir, writeFile } from 'fs/promises';
import { extname } from 'path';
import { User, UserDocument } from './user.schema';
import { Role } from '../common/roles.enum';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async onModuleInit() {
    const existingAdmin = await this.userModel.findOne({ role: Role.ADMIN });
    if (!existingAdmin) {
      const email =
        process.env.ADMIN_EMAIL || 'admin@example.com';
      const password =
        process.env.ADMIN_PASSWORD || 'admin123';
      const hashed = await bcrypt.hash(password, 10);
      await this.userModel.create({
        email,
        password: hashed,
        name: 'Admin',
        role: Role.ADMIN,
      });
      // eslint-disable-next-line no-console
      console.log('Seeded admin user:', email);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async create(data: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(data.email!);
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.userModel.create(data);
    return user;
  }

  async updateProfile(
    id: string,
    data: Partial<{
      name: string;
      companyName: string | null;
      coverPictureUrl: string | null;
      profilePictureUrl: string | null;
      firstName: string | null;
      middleName: string | null;
      lastName: string | null;
      suffix: string | null;
      gender: string | null;
      dateOfBirth: Date | string | null;
      pronoun: string | null;
      bio: string | null;
      nationality: string | null;
      civilStatus: string | null;
      schoolGraduated: string | null;
      city: string | null;
      provinceState: string | null;
      country: string | null;
      streetAddress: string | null;
      houseNumber: string | null;
      postalCode: string | null;
      taxId: string | null;
      position: string | null;
      phone: string | null;
      mobileNumber: string | null;
      linkedinUrl: string | null;
      githubUrl: string | null;
      twitterUrl: string | null;
      websiteUrl: string | null;
      otherSocialUrl: string | null;
      resumeUrl: string | null;
      coverLetterUrl: string | null;
      desiredJobTitle: string | null;
      jobCategory: string | null;
      preferredIndustry: string | null;
      employmentType: string | null;
      workSetup: string | null;
      expectedSalary: string | null;
      availableStart: string | null;
      willingToRelocate: boolean | null;
      availabilityStatus: string | null;
      noticePeriod: string | null;
      profileVisibility?: 'public' | 'private';
      openTo?: string[];
      professionalInfo?: Array<{ title?: string; organization?: string; startDate?: string | null; endDate?: string | null; description?: string | null }>;
      socialLinks?: Array<{ label?: string; url?: string }>;
      skills?: Array<{ skills?: string; skillLevel?: string | null }>;
      education?: Array<{ schoolUniversity?: string; degree?: string | null; fieldOfStudy?: string | null; startYear?: string | null; endYear?: string | null; gpa?: string | null; honorsAwards?: string | null }>;
      certifications?: Array<{ certificationName?: string; issuingOrganization?: string | null; issueDate?: string | null; expirationDate?: string | null; credentialId?: string | null; certificateUrl?: string | null }>;
      projects?: Array<{ projectName?: string; projectDescription?: string | null; technologiesUsed?: string | null; projectLink?: string | null; repository?: string | null; demoScreenshotsUrl?: string | null }>;
    }>,
  ): Promise<User> {
    const toUpdate: Record<string, unknown> = {};
    const keys = [
      'name', 'companyName', 'coverPictureUrl', 'profilePictureUrl',
      'firstName', 'middleName', 'lastName', 'suffix', 'gender', 'dateOfBirth',
      'pronoun', 'bio', 'nationality', 'civilStatus', 'schoolGraduated', 'city', 'provinceState', 'country',
      'streetAddress', 'houseNumber', 'postalCode', 'taxId', 'position', 'phone', 'mobileNumber',
      'linkedinUrl', 'githubUrl', 'twitterUrl', 'websiteUrl', 'otherSocialUrl',
      'resumeUrl', 'coverLetterUrl',
      'desiredJobTitle', 'jobCategory', 'preferredIndustry', 'employmentType', 'workSetup', 'expectedSalary', 'availableStart', 'willingToRelocate',
      'availabilityStatus', 'noticePeriod', 'profileVisibility',
    ] as const;
    for (const key of keys) {
      if (data[key] !== undefined) {
        const val = data[key];
        if (key === 'dateOfBirth') {
          toUpdate[key] = val === '' || val == null ? null : new Date(val as string);
        } else if (key === 'willingToRelocate') {
          toUpdate[key] = val === true || val === 'true' ? true : val === false || val === 'false' ? false : null;
        } else {
          toUpdate[key] = val === '' ? null : val;
        }
      }
    }
    if (data.openTo !== undefined) {
      toUpdate.openTo = Array.isArray(data.openTo) ? data.openTo.filter((s): s is string => typeof s === 'string' && s.trim() !== '') : [];
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
    return user as User;
  }

  async uploadAvatar(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<User> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Use JPEG, PNG, GIF, or WebP.');
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }
    const dir = 'uploads/avatars';
    await mkdir(dir, { recursive: true });
    const ext = extname(file.originalname) || '.jpg';
    const safeExt = /^\.(jpe?g|png|gif|webp)$/i.test(ext) ? ext : '.jpg';
    const filename = `${id}-${Date.now()}${safeExt}`;
    const filepath = `${dir}/${filename}`;
    await writeFile(filepath, file.buffer);
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/avatars/${filename}`;
    return this.updateProfile(id, { profilePictureUrl: url });
  }

  async uploadResume(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<User> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Use PDF or Word (DOC/DOCX).');
    }
    if (file.size > MAX_DOC_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }
    const dir = 'uploads/documents';
    await mkdir(dir, { recursive: true });
    const ext = extname(file.originalname) || '.pdf';
    const safeExt = /^\.(pdf|doc|docx)$/i.test(ext) ? ext : '.pdf';
    const filename = `${id}-resume-${Date.now()}${safeExt}`;
    const filepath = `${dir}/${filename}`;
    await writeFile(filepath, file.buffer);
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/documents/${filename}`;
    return this.updateProfile(id, { resumeUrl: url });
  }

  async uploadCoverLetter(
    id: string,
    file: Express.Multer.File,
    baseUrl: string,
  ): Promise<User> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Use PDF or Word (DOC/DOCX).');
    }
    if (file.size > MAX_DOC_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }
    const dir = 'uploads/documents';
    await mkdir(dir, { recursive: true });
    const ext = extname(file.originalname) || '.pdf';
    const safeExt = /^\.(pdf|doc|docx)$/i.test(ext) ? ext : '.pdf';
    const filename = `${id}-cover-${Date.now()}${safeExt}`;
    const filepath = `${dir}/${filename}`;
    await writeFile(filepath, file.buffer);
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/documents/${filename}`;
    return this.updateProfile(id, { coverLetterUrl: url });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id).select('password').exec();
    if (!user) throw new BadRequestException('User not found');
    const doc = user as UserDocument;
    const match = await bcrypt.compare(currentPassword, doc.password);
    if (!match) throw new UnauthorizedException('Current password is incorrect');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(id, { $set: { password: hashed } }).exec();
  }

  async deleteMe(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) throw new BadRequestException('User not found');
  }
}
