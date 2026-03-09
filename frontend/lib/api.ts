const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type Role = 'admin' | 'employee' | 'employer';

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
  skills?: string | null;
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

export interface User {
  id: string;
  email: string;
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
  dateOfBirth?: string | null;
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
  profileVisibility?: 'public' | 'private' | null;
  openTo?: string[] | null;
  professionalInfo?: ProfessionalInfoEntry[];
  socialLinks?: SocialLinkEntry[];
  skills?: SkillEntry[];
  education?: EducationEntry[];
  certifications?: CertificationEntry[];
  projects?: ProjectEntry[];
}

/** Display name for nav/profile: firstName + middleName + lastName, or name, or email. */
export function getDisplayName(user: User | null): string {
  if (!user) return '—';
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  const withSuffix = user.suffix ? [...parts, user.suffix].join(' ') : parts.join(' ');
  return withSuffix.trim() || user.name?.trim() || user.email?.split('@')[0] || 'User';
}

/** Avatar URL for nav/profile: uses profile picture if set, else generated initial avatar (same as Profile Settings). */
export function getAvatarUrl(user: User | null, size: number = 96): string {
  if (!user) return `https://ui-avatars.com/api/?name=User&size=${size}&background=6366f1&color=fff`;
  if (user.profilePictureUrl?.trim()) return user.profilePictureUrl.trim();
  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || user.name?.trim() || user.email?.split('@')[0] || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=${size}&background=6366f1&color=fff`;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary?: string | null;
  isActive: boolean;
  createdAt: string;
  employer?: { id: string; name: string; companyName?: string | null };
  /** All field values from Create Job Posting wizard (field id -> value) */
  formData?: Record<string, string>;
}

let token: string | null = null;

export function setToken(t: string | null) {
  token = t;
  if (typeof window !== 'undefined') {
    if (t) localStorage.setItem('token', t);
    else localStorage.removeItem('token');
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined' && !token) {
    token = localStorage.getItem('token');
  }
  return token;
}

function handleFetchError(err: unknown, fallback: string): never {
  const msg = err instanceof TypeError && err.message === 'Failed to fetch'
    ? `Unable to connect to the server. Ensure the backend is running at ${API_URL}.`
    : err instanceof Error ? err.message : fallback;
  throw new Error(msg);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const t = getToken();
  if (t) (headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    handleFetchError(err, 'Request failed');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

async function requestWithFormData<T>(path: string, formData: FormData): Promise<T> {
  const headers: HeadersInit = {};
  const t = getToken();
  if (t) (headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: formData,
      headers,
    });
  } catch (err) {
    handleFetchError(err, 'Upload failed');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      email: string;
      password: string;
      name: string;
      role?: Role;
      companyName?: string;
    }) =>
      request<{ access_token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  users: {
    me: () => request<User>('/users/me'),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return requestWithFormData<User>('/users/me/avatar', formData);
    },
    uploadResume: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return requestWithFormData<User>('/users/me/resume', formData);
    },
    uploadCoverLetter: (file: File) => {
      const formData = new FormData();
      formData.append('coverLetter', file);
      return requestWithFormData<User>('/users/me/cover-letter', formData);
    },
    updateMe: (data: Partial<{
      name: string;
      companyName: string;
      coverPictureUrl: string;
      profilePictureUrl: string;
      firstName: string;
      middleName: string;
      lastName: string;
      suffix: string;
      pronoun: string;
      dateOfBirth: string;
      pronoun: string;
      bio: string;
      nationality: string;
      civilStatus: string;
      schoolGraduated: string;
      city: string;
      provinceState: string;
      country: string;
      streetAddress: string;
      houseNumber: string;
      postalCode: string;
      taxId: string;
      position: string;
      phone: string;
      mobileNumber: string;
      linkedinUrl: string;
      githubUrl: string;
      twitterUrl: string;
      websiteUrl: string;
      otherSocialUrl: string;
      professionalInfo: ProfessionalInfoEntry[];
      socialLinks: SocialLinkEntry[];
      skills: SkillEntry[];
      education: EducationEntry[];
      certifications: CertificationEntry[];
      projects: ProjectEntry[];
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
      profileVisibility: 'public' | 'private' | null;
      openTo: string[] | null;
    }>) =>
      request<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<{ message: string }>('/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    deleteMe: () =>
      request<{ message: string }>('/users/me', { method: 'DELETE' }),
  },
  jobs: {
    list: (all?: boolean) =>
      request<Job[]>(`/jobs${all ? '?all=true' : ''}`),
    one: (id: string) => request<Job>(`/jobs/${id}`),
    myList: () => request<Job[]>('/jobs/my/list'),
    create: (data: { title: string; description: string; location?: string; salary?: string; isActive?: boolean; formData?: Record<string, string> }) =>
      request<Job>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<{ title: string; description: string; location: string; salary: string; isActive: boolean; formData?: Record<string, string> }>) =>
      request<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/jobs/${id}`, { method: 'DELETE' }),
  },
  formConfig: {
    getJobListing: () =>
      request<{
        id: string;
        key: string;
        formTitle: string;
        formDescription: string;
        steps: Array<{
          id: string;
          name: string;
          primaryLabel: string;
          secondaryLabel?: string;
          visible: boolean;
          fields: Array<{
            id: string;
            label: string;
            type: string;
            required: boolean;
            options?: string[];
            minSelections?: number;
            note?: string;
            reminder?: string;
            placeholder?: string;
            subFields?: Array<{
              id: string;
              label: string;
              type: string;
              required: boolean;
              options?: string[];
              minSelections?: number;
              note?: string;
              reminder?: string;
              placeholder?: string;
            }>;
          }>;
        }>;
      }>('/form-configs/job-listing'),
    updateJobListing: (data: {
      formTitle: string;
      formDescription: string;
      steps: Array<{
        id: string;
        name: string;
        primaryLabel: string;
        secondaryLabel: string;
        visible: boolean;
        fields: Array<{
          id: string;
          label: string;
            type:
              | 'text'
              | 'textarea'
              | 'richtext'
              | 'number'
              | 'range'
              | 'email'
              | 'select'
              | 'multiselect'
              | 'checkbox'
              | 'radio'
              | 'date'
              | 'file'
              | 'link';
          required: boolean;
            options?: string[];
            minSelections?: number;
            subFields?: Array<{
              id: string;
              label: string;
                type:
                  | 'text'
                  | 'textarea'
                | 'richtext'
                  | 'number'
                  | 'select'
                  | 'multiselect'
                  | 'checkbox'
                  | 'radio'
                | 'date'
                  | 'file'
                  | 'link';
              required: boolean;
                options?: string[];
                minSelections?: number;
                note?: string;
                reminder?: string;
                placeholder?: string;
            }>;
        }>;
      }>;
    }) =>
      request('/form-configs/job-listing', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
};
