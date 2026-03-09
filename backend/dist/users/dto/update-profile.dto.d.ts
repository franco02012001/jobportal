export declare class ProfessionalInfoEntryDto {
    title?: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}
export declare class SocialLinkEntryDto {
    label?: string;
    url?: string;
}
export declare class SkillEntryDto {
    skills?: string;
    skillLevel?: string;
}
export declare class EducationEntryDto {
    schoolUniversity?: string;
    degree?: string;
    fieldOfStudy?: string;
    startYear?: string;
    endYear?: string;
    gpa?: string;
    honorsAwards?: string;
}
export declare class CertificationEntryDto {
    certificationName?: string;
    issuingOrganization?: string;
    issueDate?: string;
    expirationDate?: string;
    credentialId?: string;
    certificateUrl?: string;
}
export declare class ProjectEntryDto {
    projectName?: string;
    projectDescription?: string;
    technologiesUsed?: string;
    projectLink?: string;
    repository?: string;
    demoScreenshotsUrl?: string;
}
export declare class UpdateProfileDto {
    name?: string;
    companyName?: string;
    coverPictureUrl?: string;
    profilePictureUrl?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    suffix?: string;
    gender?: string;
    dateOfBirth?: string;
    pronoun?: string;
    bio?: string;
    nationality?: string;
    civilStatus?: string;
    schoolGraduated?: string;
    city?: string;
    provinceState?: string;
    country?: string;
    streetAddress?: string;
    houseNumber?: string;
    postalCode?: string;
    taxId?: string;
    position?: string;
    phone?: string;
    mobileNumber?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    twitterUrl?: string;
    websiteUrl?: string;
    otherSocialUrl?: string;
    resumeUrl?: string;
    coverLetterUrl?: string;
    desiredJobTitle?: string;
    jobCategory?: string;
    preferredIndustry?: string;
    employmentType?: string;
    workSetup?: string;
    expectedSalary?: string;
    availableStart?: string;
    willingToRelocate?: boolean;
    availabilityStatus?: string;
    noticePeriod?: string;
    openTo?: string[];
    profileVisibility?: 'public' | 'private';
    professionalInfo?: ProfessionalInfoEntryDto[];
    socialLinks?: SocialLinkEntryDto[];
    skills?: SkillEntryDto[];
    education?: EducationEntryDto[];
    certifications?: CertificationEntryDto[];
    projects?: ProjectEntryDto[];
}
