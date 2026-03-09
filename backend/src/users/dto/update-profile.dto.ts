import { IsOptional, IsString, MinLength, IsUrl, MaxLength, ValidateIf, IsDateString, IsArray, ValidateNested, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ProfessionalInfoEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  organization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}

export class SocialLinkEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  url?: string;
}

export class SkillEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  skills?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  skillLevel?: string;
}

export class EducationEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  schoolUniversity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  degree?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldOfStudy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  startYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  endYear?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gpa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  honorsAwards?: string;
}

export class CertificationEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  certificationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  issuingOrganization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  issueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  expirationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  credentialId?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  certificateUrl?: string;
}

export class ProjectEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  projectName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  projectDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  technologiesUsed?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  projectLink?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  repository?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @MaxLength(2000)
  demoScreenshotsUrl?: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  coverPictureUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePictureUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  middleName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  suffix?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  pronoun?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  civilStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  schoolGraduated?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  provinceState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  streetAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  houseNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  mobileNumber?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  twitterUrl?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @IsUrl()
  otherSocialUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverLetterUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  desiredJobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobCategory?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  preferredIndustry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  employmentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  workSetup?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  expectedSalary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  availableStart?: string;

  @IsOptional()
  @IsBoolean()
  willingToRelocate?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  availabilityStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  noticePeriod?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  openTo?: string[];

  @IsOptional()
  @IsString()
  @IsIn(['public', 'private'])
  profileVisibility?: 'public' | 'private';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfessionalInfoEntryDto)
  professionalInfo?: ProfessionalInfoEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkEntryDto)
  socialLinks?: SocialLinkEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillEntryDto)
  skills?: SkillEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationEntryDto)
  education?: EducationEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificationEntryDto)
  certifications?: CertificationEntryDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectEntryDto)
  projects?: ProjectEntryDto[];
}

