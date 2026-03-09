'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { api, type User, type ProfessionalInfoEntry, type SocialLinkEntry, type SkillEntry, type EducationEntry, type CertificationEntry, type ProjectEntry } from '@/lib/api';

const RichTextEditor = dynamic(() => import('@/app/components/RichTextEditor'), { ssr: false });

const PRONOUN_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'he/him', label: 'He/Him' },
  { value: 'she/her', label: 'She/Her' },
  { value: 'they/them', label: 'They/Them' },
  { value: 'prefer not to say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
];

const CIVIL_STATUS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Separated', label: 'Separated' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Temporary', label: 'Temporary' },
];

const WORK_SETUP_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
];

const AVAILABILITY_STATUS_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Available', label: 'Available' },
  { value: 'Open to offers', label: 'Open to offers' },
  { value: 'Not looking', label: 'Not looking' },
  { value: 'Busy', label: 'Busy' },
];

const OPEN_TO_OPTIONS = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Freelance', label: 'Freelance' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Temporary', label: 'Temporary' },
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
const SKILL_LEVEL_ORDER = ['Expert', 'Advanced', 'Intermediate', 'Beginner'];
const SKILL_LEVEL_OPTIONS = [
  { value: '', label: 'Select level' },
  ...SKILL_LEVELS.map((v) => ({ value: v, label: v })),
];

const DEGREE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'Associate', label: 'Associate' },
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Master', label: 'Master' },
  { value: 'Doctorate', label: 'Doctorate' },
];

const SCHOOL_UNIVERSITY_OPTIONS = [
  'University of the Philippines',
  'Ateneo de Manila University',
  'De La Salle University',
  'University of Santo Tomas',
  'Polytechnic University of the Philippines',
  'Far Eastern University',
  'Mapúa University',
  'FEATI University',
  'Adamson University',
  'San Beda University',
  'Technological Institute of the Philippines',
  'University of the East',
  'Pamantasan ng Lungsod ng Maynila',
  'Saint Louis University Philippines',
  'Mindanao State University',
  'Other',
];

const FIELD_OF_STUDY_ASSOCIATE = [
  'Associate in Arts', 'Associate in Science', 'Associate in Applied Science', 'Associate in General Studies',
  'Associate in Information Technology', 'Associate in Computer Science', 'Associate in Computer Technology',
  'Associate in Software Development', 'Associate in Web Development', 'Associate in Network Administration',
  'Associate in Cybersecurity', 'Associate in Business Administration', 'Associate in Accounting', 'Associate in Marketing',
  'Associate in Office Administration', 'Associate in Entrepreneurship', 'Associate in Nursing', 'Associate in Medical Technology',
  'Associate in Health Science', 'Associate in Physical Therapy Assistant', 'Associate in Graphic Design', 'Associate in Multimedia Arts',
  'Associate in Digital Media', 'Other',
];

const FIELD_OF_STUDY_BACHELOR = [
  'Bachelor of Arts', 'Bachelor of Science', 'Bachelor of Science in Computer Science', 'Bachelor of Science in Information Technology',
  'Bachelor of Science in Software Engineering', 'Bachelor of Science in Information Systems', 'Bachelor of Business Administration',
  'Bachelor of Engineering', 'Bachelor of Accountancy', 'Bachelor of Education', 'Bachelor of Nursing', 'Bachelor of Architecture',
  'Bachelor of Fine Arts', 'Bachelor of Communication', 'Bachelor of Psychology', 'Bachelor of Public Administration',
  'Bachelor of Hospitality Management', 'Bachelor of Tourism Management', 'Other',
];

const FIELD_OF_STUDY_MASTER = [
  'Master of Arts', 'Master of Science', 'Master of Business Administration', 'Master of Computer Science',
  'Master of Information Technology', 'Master of Engineering', 'Master of Education', 'Master of Public Administration',
  'Master of Public Health', 'Master of Accountancy', 'Master of Finance', 'Master of Psychology', 'Master of Communication',
  'Master of Data Science', 'Master of Information Systems', 'Other',
];

const FIELD_OF_STUDY_DOCTORATE = [
  'Doctor of Philosophy (PhD)', 'Doctor of Education (EdD)', 'Doctor of Business Administration (DBA)', 'Doctor of Medicine (MD)',
  'Doctor of Engineering (DEng)', 'Doctor of Psychology (PsyD)', 'Doctor of Public Health (DrPH)', 'Doctor of Science (DSc)',
  'Doctor of Laws (LLD)', 'Doctor of Computer Science', 'Doctor of Information Technology', 'Other',
];

function getFieldOfStudyOptions(degree: string, currentValue?: string): { value: string; label: string }[] {
  const list =
    degree === 'Associate' ? FIELD_OF_STUDY_ASSOCIATE :
    degree === 'Bachelor' ? FIELD_OF_STUDY_BACHELOR :
    degree === 'Master' ? FIELD_OF_STUDY_MASTER :
    degree === 'Doctorate' ? FIELD_OF_STUDY_DOCTORATE :
    [];
  const options = list.map((s) => ({ value: s, label: s }));
  if (currentValue && currentValue.trim() && !options.some((o) => o.value === currentValue)) {
    options.push({ value: currentValue.trim(), label: currentValue.trim() });
  }
  return [{ value: '', label: 'Select' }, ...options];
}

function skillLevelSortIndex(level: string | null | undefined): number {
  const i = SKILL_LEVEL_ORDER.indexOf(level?.trim() || '');
  return i >= 0 ? i : SKILL_LEVEL_ORDER.length;
}

function getEntrySkillsText(entry: SkillEntry): string {
  return entry.skills?.trim() || [entry.primarySkills, entry.secondarySkills, entry.softSkills].filter(Boolean).join(', ') || '';
}

function toDateInputValue(s: string | null | undefined): string {
  const v = (s || '').trim();
  if (v.length === 4 && /^\d{4}$/.test(v)) return `${v}-01-01`;
  if (v.length === 7 && /^\d{4}-\d{2}$/.test(v)) return `${v}-01`;
  if (v.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return '';
}

function parseEduDate(s: string | null | undefined): number | null {
  const v = (s || '').trim();
  if (!v || v.toLowerCase() === 'present') return null;
  if (v.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(v)) return new Date(v.slice(0, 10)).getTime();
  if (v.length === 7 && /^\d{4}-\d{2}$/.test(v)) return new Date(`${v}-01`).getTime();
  if (v.length === 4 && /^\d{4}$/.test(v)) return new Date(`${v}-01-01`).getTime();
  return null;
}

function sortEducationByDate(a: EducationEntry, b: EducationEntry): number {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = todayStart.getTime();
  const aEnd = parseEduDate(a.endYear);
  const bEnd = parseEduDate(b.endYear);
  const aCurrent = aEnd === null || aEnd >= today;
  const bCurrent = bEnd === null || bEnd >= today;
  if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
  if (aCurrent) {
    const aStart = parseEduDate(a.startYear) ?? 0;
    const bStart = parseEduDate(b.startYear) ?? 0;
    return bStart - aStart;
  }
  return (bEnd ?? 0) - (aEnd ?? 0);
}

function groupSkillsByLevel(skillsList: SkillEntry[]): { level: string; combinedSkills: string }[] {
  const byLevel = new Map<string, string[]>();
  for (const entry of skillsList) {
    const level = (entry.skillLevel || '').trim() || '—';
    const text = getEntrySkillsText(entry);
    if (!byLevel.has(level)) byLevel.set(level, []);
    if (text) byLevel.get(level)!.push(text);
  }
  return SKILL_LEVEL_ORDER.filter((l) => byLevel.has(l))
    .concat([...byLevel.keys()].filter((l) => !SKILL_LEVEL_ORDER.includes(l)))
    .map((level) => ({
      level,
      combinedSkills: (byLevel.get(level) || []).join(', '),
    }));
}

function defaultAvatarUrl(user: User | null) {
  if (!user) return 'https://ui-avatars.com/api/?name=User&size=256&background=6366f1&color=fff';
  if (user.profilePictureUrl) return user.profilePictureUrl;
  const displayName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ') || user.name?.trim() || user.email?.split('@')[0] || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&size=256&background=6366f1&color=fff`;
}

function displayName(user: User | null) {
  if (!user) return '—';
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  const withSuffix = user.suffix ? [...parts, user.suffix].join(' ') : parts.join(' ');
  return withSuffix.trim() || user.name || '—';
}

function roleLabel(role: string) {
  if (role === 'employee') return 'Job Seeker';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editModal, setEditModal] = useState<'profile' | 'address' | 'social' | 'professional' | 'skills' | 'education' | 'certifications' | 'projects' | 'jobPreferences' | 'availability' | null>(null);
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfoEntry[]>([]);
  const [professionalEditIndex, setProfessionalEditIndex] = useState<number | null>(null);
  const [expandedProDescIndex, setExpandedProDescIndex] = useState<number | null>(null);
  const [proTitle, setProTitle] = useState('');
  const [proOrganization, setProOrganization] = useState('');
  const [proStartDate, setProStartDate] = useState('');
  const [proEndDate, setProEndDate] = useState('');
  const [proDescription, setProDescription] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bio, setBio] = useState('');
  const [expandedBio, setExpandedBio] = useState(false);
  const [nationality, setNationality] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [name, setName] = useState('');
  const [pronoun, setPronoun] = useState('');
  const [schoolGraduated, setSchoolGraduated] = useState('');
  const [position, setPosition] = useState('');
  const [city, setCity] = useState('');
  const [provinceState, setProvinceState] = useState('');
  const [country, setCountry] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLinkEntry[]>([]);
  const [socialEditIndex, setSocialEditIndex] = useState<number | null>(null);
  const [socialLabel, setSocialLabel] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillsEditIndex, setSkillsEditIndex] = useState<number | null>(null);
  const [editingSkillLevel, setEditingSkillLevel] = useState<string | null>(null);
  const [skillText, setSkillText] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [expandedSkillLevels, setExpandedSkillLevels] = useState<Set<string>>(new Set());
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const schoolOptionsWithCustom = useMemo(() => {
    const custom = new Set<string>();
    education.forEach((e) => {
      const s = e.schoolUniversity?.trim();
      if (s && !SCHOOL_UNIVERSITY_OPTIONS.includes(s)) custom.add(s);
    });
    const base = SCHOOL_UNIVERSITY_OPTIONS.filter((x) => x !== 'Other');
    return [...base, ...[...custom].sort(), 'Other'];
  }, [education]);
  const sortedEducation = useMemo(() => [...education].sort(sortEducationByDate), [education]);
  const [educationEditIndex, setEducationEditIndex] = useState<number | null>(null);
  const [eduSchool, setEduSchool] = useState('');
  const [eduSchoolQuery, setEduSchoolQuery] = useState('');
  const [eduSchoolOther, setEduSchoolOther] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduFieldOfStudy, setEduFieldOfStudy] = useState('');
  const [eduFieldOfStudyOther, setEduFieldOfStudyOther] = useState('');
  const [eduFieldOfStudyQuery, setEduFieldOfStudyQuery] = useState('');
  const [eduStartYear, setEduStartYear] = useState('');
  const [eduEndYear, setEduEndYear] = useState('');
  const [eduEndPresent, setEduEndPresent] = useState(false);
  const [eduGpa, setEduGpa] = useState('');
  const [eduHonorsAwards, setEduHonorsAwards] = useState('');
  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [certEditIndex, setCertEditIndex] = useState<number | null>(null);
  const [certName, setCertName] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certExpDate, setCertExpDate] = useState('');
  const [certCredentialId, setCertCredentialId] = useState('');
  const [certUrl, setCertUrl] = useState('');
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [projectEditIndex, setProjectEditIndex] = useState<number | null>(null);
  const [projName, setProjName] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projTechnologies, setProjTechnologies] = useState('');
  const [projLink, setProjLink] = useState('');
  const [projRepository, setProjRepository] = useState('');
  const [projDemoUrl, setProjDemoUrl] = useState('');
  const [desiredJobTitle, setDesiredJobTitle] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [preferredIndustry, setPreferredIndustry] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [workSetup, setWorkSetup] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [availableStart, setAvailableStart] = useState('');
  const [willingToRelocate, setWillingToRelocate] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [openTo, setOpenTo] = useState<string[]>([]);

  useEffect(() => {
    api.users
      .me()
      .then((u) => {
        setUser(u);
        setName(u.name ?? '');
        setProfilePictureUrl(u.profilePictureUrl ?? '');
        setFirstName(u.firstName ?? '');
        setMiddleName(u.middleName ?? '');
        setLastName(u.lastName ?? '');
        setSuffix(u.suffix ?? '');
        setDateOfBirth(u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : '');
        setBio(u.bio ?? '');
        setExpandedBio(false);
        setNationality(u.nationality ?? '');
        setCivilStatus(u.civilStatus ?? '');
        setPronoun(u.pronoun ?? '');
        setSchoolGraduated(u.schoolGraduated ?? '');
        setPosition(u.position ?? '');
        setCity(u.city ?? '');
        setProvinceState(u.provinceState ?? '');
        setCountry(u.country ?? '');
        setStreetAddress(u.streetAddress ?? '');
        setHouseNumber(u.houseNumber ?? '');
        setPostalCode(u.postalCode ?? '');
        setTaxId(u.taxId ?? '');
        setPhone(u.phone ?? '');
        setMobileNumber(u.mobileNumber ?? '');
        const hasNewSocial = u.socialLinks && u.socialLinks.length > 0;
        const migrated: SocialLinkEntry[] = hasNewSocial
          ? u.socialLinks!
          : [
              ...(u.linkedinUrl ? [{ label: 'LinkedIn', url: u.linkedinUrl }] : []),
              ...(u.githubUrl ? [{ label: 'GitHub', url: u.githubUrl }] : []),
              ...(u.websiteUrl ? [{ label: 'Portfolio', url: u.websiteUrl }] : []),
              ...(u.otherSocialUrl ? [{ label: 'Other Social', url: u.otherSocialUrl }] : []),
            ];
        setSocialLinks(migrated);
        setProfessionalInfo(u.professionalInfo ?? []);
        setSkills(u.skills ?? []);
        setEducation(u.education ?? []);
        setCertifications(u.certifications ?? []);
        setProjects(u.projects ?? []);
        setDesiredJobTitle(u.desiredJobTitle ?? '');
        setJobCategory(u.jobCategory ?? '');
        setPreferredIndustry(u.preferredIndustry ?? '');
        setEmploymentType(u.employmentType ?? '');
        setWorkSetup(u.workSetup ?? '');
        setExpectedSalary(u.expectedSalary ?? '');
        setAvailableStart(u.availableStart ?? '');
        setWillingToRelocate(u.willingToRelocate ?? false);
        setAvailabilityStatus(u.availabilityStatus ?? '');
        setNoticePeriod(u.noticePeriod ?? '');
        setOpenTo(u.openTo ?? []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile'));
  }, []);

  async function saveProfile(data: Record<string, string | boolean | string[] | undefined>) {
    if (!user) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await api.users.updateMe(data);
      setUser(updated);
      setMessage('Profile updated.');
      setEditModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image (JPEG, PNG, GIF, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be 5MB or smaller.');
      return;
    }
    setUploadingAvatar(true);
    setError('');
    setMessage('');
    e.target.value = '';
    try {
      const updated = await api.users.uploadAvatar(file);
      setUser(updated);
      setProfilePictureUrl(updated.profilePictureUrl ?? '');
      setMessage('Profile picture updated.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  }

  const DOC_ACCEPT = 'application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx';
  const MAX_DOC_MB = 10;

  async function handleResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please select a PDF or Word document.');
      return;
    }
    if (file.size > MAX_DOC_MB * 1024 * 1024) {
      setError(`File must be ${MAX_DOC_MB}MB or smaller.`);
      return;
    }
    setUploadingResume(true);
    setError('');
    setMessage('');
    e.target.value = '';
    try {
      const updated = await api.users.uploadResume(file);
      setUser(updated);
      setMessage('Resume uploaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleCoverLetterFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      setError('Please select a PDF or Word document.');
      return;
    }
    if (file.size > MAX_DOC_MB * 1024 * 1024) {
      setError(`File must be ${MAX_DOC_MB}MB or smaller.`);
      return;
    }
    setUploadingCoverLetter(true);
    setError('');
    setMessage('');
    e.target.value = '';
    try {
      const updated = await api.users.uploadCoverLetter(file);
      setUser(updated);
      setMessage('Cover letter uploaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingCoverLetter(false);
    }
  }

  async function removeResume() {
    if (!user) return;
    setError('');
    setMessage('');
    try {
      const updated = await api.users.updateMe({ resumeUrl: null });
      setUser(updated);
      setMessage('Resume removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  async function removeCoverLetter() {
    if (!user) return;
    setError('');
    setMessage('');
    try {
      const updated = await api.users.updateMe({ coverLetterUrl: null });
      setUser(updated);
      setMessage('Cover letter removed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  const locationLine = [city, provinceState, country].filter(Boolean).join(', ') || '—';
  const avatarSrc = profilePictureUrl.trim() || defaultAvatarUrl(user);
  const inputClass = 'mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const labelClass = 'block text-xs font-medium text-slate-500';

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">{error || 'Loading…'}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold text-slate-900">Profile Settings</h1>

      <main className="min-w-0 space-y-6">
            {message && (
              <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>
            )}
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
            )}

            <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept={DOC_ACCEPT}
                  className="hidden"
                  onChange={handleResumeFileChange}
                />
                <input
                  ref={coverLetterInputRef}
                  type="file"
                  accept={DOC_ACCEPT}
                  className="hidden"
                  onChange={handleCoverLetterFileChange}
                />

                {/* Card 1: Profile Summary */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="h-20 w-20 overflow-hidden rounded-full bg-slate-200">
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className={`h-full w-full object-cover ${uploadingAvatar ? 'opacity-60' : ''}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultAvatarUrl(user);
                          }}
                        />
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          disabled={uploadingAvatar}
                          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                          aria-label="Change photo"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold text-slate-900 truncate">{displayName(user)}</h2>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium">
                          <span
                            className={`h-2 w-2 rounded-full ${(user?.availabilityStatus || '').trim() === 'Available' || (user?.availabilityStatus || '').trim() === 'Open to offers' ? 'bg-emerald-500' : 'bg-red-500'}`}
                            aria-hidden
                          />
                          {(user?.availabilityStatus || '').trim() === 'Available' || (user?.availabilityStatus || '').trim() === 'Open to offers'
                            ? 'Active'
                            : 'Not Active'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{position || schoolGraduated || roleLabel(user.role)}</p>
                      <p className="text-sm text-slate-500">{locationLine}</p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Personal Information */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
                    <button
                      type="button"
                      onClick={() => setEditModal('profile')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">First name</p>
                      <p className="text-sm font-medium text-slate-900">{firstName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Middle name</p>
                      <p className="text-sm font-medium text-slate-900">{middleName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Last name</p>
                      <p className="text-sm font-medium text-slate-900">{lastName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Suffix</p>
                      <p className="text-sm font-medium text-slate-900">{suffix || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pronoun</p>
                      <p className="text-sm font-medium text-slate-900">{pronoun || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Date of birth</p>
                      <p className="text-sm font-medium text-slate-900">{dateOfBirth ? new Date(dateOfBirth).toLocaleDateString() : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Nationality</p>
                      <p className="text-sm font-medium text-slate-900">{nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Civil status</p>
                      <p className="text-sm font-medium text-slate-900">{civilStatus || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500">Short bio / About</p>
                      <div>
                        <p className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
                          {(() => {
                            const text = (bio || '').trim();
                            const len = text.length;
                            if (!text) return '—';
                            if (len <= 100 || expandedBio) return text;
                            return text.slice(0, 100).trim() + '…';
                          })()}
                        </p>
                        {(bio || '').trim().length > 100 && (
                          <button
                            type="button"
                            onClick={() => setExpandedBio((prev) => !prev)}
                            className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            {expandedBio ? 'See less' : 'See more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Contact Information */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Contact Information</h3>
                    <button
                      type="button"
                      onClick={() => setEditModal('address')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Email Address</p>
                      <p className="text-sm font-medium text-slate-900">{user?.email ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Mobile Number</p>
                      <p className="text-sm font-medium text-slate-900">{mobileNumber || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500">Address</p>
                      <p className="text-sm font-medium text-slate-900">{streetAddress || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">City</p>
                      <p className="text-sm font-medium text-slate-900">{city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Province / State</p>
                      <p className="text-sm font-medium text-slate-900">{provinceState || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Country</p>
                      <p className="text-sm font-medium text-slate-900">{country || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Zip / Postal Code</p>
                      <p className="text-sm font-medium text-slate-900">{postalCode || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Card 4: Professional Information */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Professional Information</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setProfessionalEditIndex(null);
                        setProTitle('');
                        setProOrganization('');
                        setProStartDate('');
                        setProEndDate('');
                        setProDescription('');
                        setEditModal('professional');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {professionalInfo.length === 0 ? (
                    <p className="text-sm text-slate-500">No professional information yet. Click Add to add an entry.</p>
                  ) : (
                    <ul className="space-y-4">
                      {professionalInfo.map((entry, index) => (
                        <li key={entry.id ?? index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900">{entry.title || '—'}</p>
                              <p className="text-sm text-slate-600">{entry.organization || '—'}</p>
                              {(entry.startDate || entry.endDate) && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {entry.startDate || '—'} – {entry.endDate && entry.endDate.toLowerCase() !== 'present' ? entry.endDate : 'Present'}
                                </p>
                              )}
                              {entry.description && (
                                <div className="mt-2">
                                  <div
                                    className={`text-sm text-slate-700 [&_p]:my-0.5 [&_ul]:my-0.5 [&_li]:my-0 [&_a]:text-blue-600 [&_a]:underline ${expandedProDescIndex === index ? '' : 'line-clamp-3'}`}
                                    dangerouslySetInnerHTML={{ __html: entry.description }}
                                  />
                                  {entry.description.replace(/<[^>]*>/g, '').trim().length > 100 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedProDescIndex((prev) => (prev === index ? null : index))}
                                      className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                                    >
                                      {expandedProDescIndex === index ? 'See less' : 'See more'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setProfessionalEditIndex(index);
                                  setProTitle(entry.title ?? '');
                                  setProOrganization(entry.organization ?? '');
                                  setProStartDate(entry.startDate ? String(entry.startDate).slice(0, 10) : '');
                                  const end = entry.endDate ? String(entry.endDate) : '';
                                  setProEndDate(end && end.toLowerCase() !== 'present' ? end.slice(0, 10) : '');
                                  setProDescription(entry.description ?? '');
                                  setEditModal('professional');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = professionalInfo.filter((_, i) => i !== index);
                                  setProfessionalInfo(next);
                                  try {
                                    const updated = await api.users.updateMe({ professionalInfo: next });
                                    setUser(updated);
                                    setProfessionalInfo(updated.professionalInfo ?? []);
                                    setMessage('Entry removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card 6: Skills */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Skills</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSkillsEditIndex(null);
                        setEditingSkillLevel(null);
                        setSkillText('');
                        setSkillLevel('');
                        setEditModal('skills');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-sm text-slate-500">No skills yet. Click Add to add an entry.</p>
                  ) : (
                    <ul className="space-y-4">
                      {groupSkillsByLevel(skills).map(({ level, combinedSkills }) => {
                        const skillList = (combinedSkills || '').split(',').map((s) => s.trim()).filter(Boolean);
                        const maxVisible = 5;
                        const isLong = skillList.length > maxVisible;
                        const expanded = expandedSkillLevels.has(level);
                        const visibleSkills = isLong && !expanded ? skillList.slice(0, maxVisible) : skillList;
                        const displayText = visibleSkills.join(', ');
                        return (
                        <li key={level} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1 grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-xs text-slate-500">Skills</p>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{displayText || '—'}</p>
                                  {isLong && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedSkillLevels((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(level)) next.delete(level);
                                        else next.add(level);
                                        return next;
                                      })}
                                      className="mt-1 text-xs font-medium text-blue-600 hover:underline"
                                    >
                                      {expanded ? 'See less' : 'See more'}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Skill Level</p>
                                <p className="text-sm font-medium text-slate-900">{level && (SKILL_LEVELS as readonly string[]).includes(level) ? level : level === '—' ? '—' : level}</p>
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSkillLevel(level === '—' ? '' : level);
                                  setSkillText(combinedSkills);
                                  setSkillLevel(level === '—' ? '' : level);
                                  setEditModal('skills');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = skills.filter((e) => (e.skillLevel || '').trim() !== (level === '—' ? '' : level));
                                  setSkills(next);
                                  try {
                                    const updated = await api.users.updateMe({ skills: next.map((e) => ({ skills: getEntrySkillsText(e), skillLevel: e.skillLevel ?? undefined })) });
                                    setUser(updated);
                                    setSkills(updated.skills ?? []);
                                    setMessage('Skill entry removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ); })}
                    </ul>
                  )}
                </div>

                {/* Card 7: Education */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Education</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setEducationEditIndex(null);
                        setEduSchool('');
                        setEduSchoolQuery('');
                        setEduSchoolOther('');
                        setEduDegree('');
                        setEduFieldOfStudy('');
                        setEduFieldOfStudyOther('');
                        setEduFieldOfStudyQuery('');
                        setEduStartYear('');
                        setEduEndYear('');
                        setEduEndPresent(false);
                        setEduGpa('');
                        setEduHonorsAwards('');
                        setEditModal('education');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {education.length === 0 ? (
                    <p className="text-sm text-slate-500">No education entries yet. Click Add to add one.</p>
                  ) : (
                    <ul className="space-y-4">
                      {sortedEducation.map((entry) => {
                        const originalIndex = education.indexOf(entry);
                        return (
                        <li key={entry.id ?? `edu-${originalIndex}`} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-slate-500">School / University</p>
                              <p className="text-sm font-medium text-slate-900">{entry.schoolUniversity || '—'}</p>
                              {(entry.degree || entry.fieldOfStudy) && (
                                <p className="mt-1 text-sm text-slate-700">{[entry.degree, entry.fieldOfStudy].filter(Boolean).join(' · ')}</p>
                              )}
                              {(entry.startYear || entry.endYear) && (
                                <p className="mt-1 text-xs text-slate-500">{entry.startYear || '—'} – {entry.endYear || 'Present'}</p>
                              )}
                              {entry.gpa && <p className="mt-1 text-xs text-slate-600">GPA: {entry.gpa}</p>}
                              {entry.honorsAwards && (
                                <p className="mt-2 text-xs text-slate-500">Honors / Awards: <span className="text-slate-700">{entry.honorsAwards}</span></p>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEducationEditIndex(originalIndex);
                                  const sch = entry.schoolUniversity ?? '';
                                  const schoolInList = schoolOptionsWithCustom.includes(sch);
                                  setEduSchool(schoolInList ? sch : 'Other');
                                  setEduSchoolOther(schoolInList ? '' : sch);
                                  setEduSchoolQuery('');
                                  setEduDegree(entry.degree ?? '');
                                  const fos = entry.fieldOfStudy ?? '';
                                  const staticOpts = getFieldOfStudyOptions(entry.degree ?? '', fos);
                                  const staticValues = new Set(staticOpts.map((o) => o.value).filter(Boolean));
                                  const customFos = education
                                    .filter((e) => (e.degree || '').trim() === (entry.degree || '').trim())
                                    .map((e) => e.fieldOfStudy?.trim())
                                    .filter(Boolean);
                                  const fosInList = staticValues.has(fos) || customFos.some((c) => c?.toLowerCase() === fos.toLowerCase());
                                  setEduFieldOfStudy(fosInList ? fos : 'Other');
                                  setEduFieldOfStudyOther(fosInList ? '' : fos);
                                  setEduFieldOfStudyQuery('');
                                  setEduStartYear(toDateInputValue(entry.startYear));
                                  setEduEndPresent(!entry.endYear || String(entry.endYear).trim().toLowerCase() === 'present');
                                  setEduEndYear(entry.endYear && String(entry.endYear).trim().toLowerCase() !== 'present' ? toDateInputValue(entry.endYear) : '');
                                  setEduGpa(entry.gpa ?? '');
                                  setEduHonorsAwards(entry.honorsAwards ?? '');
                                  setEditModal('education');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = education.filter((_, i) => i !== originalIndex);
                                  setEducation(next);
                                  try {
                                    const updated = await api.users.updateMe({ education: next });
                                    setUser(updated);
                                    setEducation(updated.education ?? []);
                                    setMessage('Education entry removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                      })}
                    </ul>
                  )}
                </div>

                {/* Card 8: Certifications */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Certifications</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setCertEditIndex(null);
                        setCertName('');
                        setCertOrg('');
                        setCertIssueDate('');
                        setCertExpDate('');
                        setCertCredentialId('');
                        setCertUrl('');
                        setEditModal('certifications');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {certifications.length === 0 ? (
                    <p className="text-sm text-slate-500">No certifications yet. Click Add to add one.</p>
                  ) : (
                    <ul className="space-y-4">
                      {certifications.map((entry, index) => (
                        <li key={entry.id ?? index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-slate-500">Certification Name</p>
                              <p className="text-sm font-medium text-slate-900">{entry.certificationName || '—'}</p>
                              {entry.issuingOrganization && (
                                <p className="mt-1 text-sm text-slate-600">Issued by: {entry.issuingOrganization}</p>
                              )}
                              {(entry.issueDate || entry.expirationDate) && (
                                <p className="mt-1 text-xs text-slate-500">Issue: {entry.issueDate || '—'} · Expires: {entry.expirationDate || '—'}</p>
                              )}
                              {entry.credentialId && <p className="mt-1 text-xs text-slate-600">Credential ID: {entry.credentialId}</p>}
                              {entry.certificateUrl && (
                                <a href={entry.certificateUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-blue-600 hover:underline">View certificate →</a>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setCertEditIndex(index);
                                  setCertName(entry.certificationName ?? '');
                                  setCertOrg(entry.issuingOrganization ?? '');
                                  setCertIssueDate(entry.issueDate ?? '');
                                  setCertExpDate(entry.expirationDate ?? '');
                                  setCertCredentialId(entry.credentialId ?? '');
                                  setCertUrl(entry.certificateUrl ?? '');
                                  setEditModal('certifications');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = certifications.filter((_, i) => i !== index);
                                  setCertifications(next);
                                  try {
                                    const updated = await api.users.updateMe({ certifications: next });
                                    setUser(updated);
                                    setCertifications(updated.certifications ?? []);
                                    setMessage('Certification removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card 9: Portfolio / Projects */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Portfolio / Projects</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setProjectEditIndex(null);
                        setProjName('');
                        setProjDescription('');
                        setProjTechnologies('');
                        setProjLink('');
                        setProjRepository('');
                        setProjDemoUrl('');
                        setEditModal('projects');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {projects.length === 0 ? (
                    <p className="text-sm text-slate-500">No projects yet. Click Add to add one.</p>
                  ) : (
                    <ul className="space-y-4">
                      {projects.map((entry, index) => (
                        <li key={entry.id ?? index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900">{entry.projectName || '—'}</p>
                              {entry.projectDescription && (
                                <p className="mt-1 text-sm text-slate-700 line-clamp-2">{entry.projectDescription}</p>
                              )}
                              {entry.technologiesUsed && (
                                <p className="mt-1 text-xs text-slate-500">Technologies: {entry.technologiesUsed}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-2">
                                {entry.projectLink && (
                                  <a href={entry.projectLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Project →</a>
                                )}
                                {entry.repository && (
                                  <a href={entry.repository} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Repository →</a>
                                )}
                                {entry.demoScreenshotsUrl && (
                                  <a href={entry.demoScreenshotsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Demo / Screenshots →</a>
                                )}
                              </div>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setProjectEditIndex(index);
                                  setProjName(entry.projectName ?? '');
                                  setProjDescription(entry.projectDescription ?? '');
                                  setProjTechnologies(entry.technologiesUsed ?? '');
                                  setProjLink(entry.projectLink ?? '');
                                  setProjRepository(entry.repository ?? '');
                                  setProjDemoUrl(entry.demoScreenshotsUrl ?? '');
                                  setEditModal('projects');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = projects.filter((_, i) => i !== index);
                                  setProjects(next);
                                  try {
                                    const updated = await api.users.updateMe({ projects: next });
                                    setUser(updated);
                                    setProjects(updated.projects ?? []);
                                    setMessage('Project removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card 10: Social Links (bottom) */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Social Links</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setSocialEditIndex(null);
                        setSocialLabel('');
                        setSocialUrl('');
                        setEditModal('social');
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>
                  {socialLinks.length === 0 ? (
                    <p className="text-sm text-slate-500">No social links yet. Click Add to add one.</p>
                  ) : (
                    <ul className="space-y-4">
                      {socialLinks.map((entry, index) => (
                        <li key={index} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900">{entry.label || '—'}</p>
                              {entry.url && (
                                <a href={entry.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm text-blue-600 hover:underline">{entry.url}</a>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSocialEditIndex(index);
                                  setSocialLabel(entry.label ?? '');
                                  setSocialUrl(entry.url ?? '');
                                  setEditModal('social');
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                aria-label="Edit"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const next = socialLinks.filter((_, i) => i !== index);
                                  setSocialLinks(next);
                                  try {
                                    const updated = await api.users.updateMe({ socialLinks: next });
                                    setUser(updated);
                                    setSocialLinks(updated.socialLinks ?? []);
                                    setMessage('Link removed.');
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to remove');
                                  }
                                }}
                                className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                aria-label="Delete"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Card 11: Resume / Documents (bottom) */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">Resume / Documents</h3>
                  <div className="space-y-6">
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-sm font-medium text-slate-700">Upload Resume</p>
                      <p className="mt-1 text-xs text-slate-500">PDF or Word (DOC/DOCX), max 10MB</p>
                      {user?.resumeUrl ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View resume</a>
                          <span className="text-slate-300">|</span>
                          <button type="button" onClick={() => resumeInputRef.current?.click()} disabled={uploadingResume} className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50">Upload new</button>
                          <span className="text-slate-300">|</span>
                          <button type="button" onClick={removeResume} className="text-sm text-red-600 hover:underline">Remove</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resumeInputRef.current?.click()}
                          disabled={uploadingResume}
                          className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {uploadingResume ? (
                            <>Uploading…</>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Choose file
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-sm font-medium text-slate-700">Upload Cover Letter</p>
                      <p className="mt-1 text-xs text-slate-500">PDF or Word (DOC/DOCX), max 10MB</p>
                      {user?.coverLetterUrl ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <a href={user.coverLetterUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View cover letter</a>
                          <span className="text-slate-300">|</span>
                          <button type="button" onClick={() => coverLetterInputRef.current?.click()} disabled={uploadingCoverLetter} className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50">Upload new</button>
                          <span className="text-slate-300">|</span>
                          <button type="button" onClick={removeCoverLetter} className="text-sm text-red-600 hover:underline">Remove</button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => coverLetterInputRef.current?.click()}
                          disabled={uploadingCoverLetter}
                          className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {uploadingCoverLetter ? (
                            <>Uploading…</>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              Choose file
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card 12: Job Preferences (bottom) */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Job Preferences</h3>
                    <button
                      type="button"
                      onClick={() => setEditModal('jobPreferences')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Desired Job Title</p>
                      <p className="text-sm font-medium text-slate-900">{user?.desiredJobTitle || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Job Category</p>
                      <p className="text-sm font-medium text-slate-900">{user?.jobCategory || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Preferred Industry</p>
                      <p className="text-sm font-medium text-slate-900">{user?.preferredIndustry || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Employment Type</p>
                      <p className="text-sm font-medium text-slate-900">{user?.employmentType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Work Setup</p>
                      <p className="text-sm font-medium text-slate-900">{user?.workSetup || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Expected Salary</p>
                      <p className="text-sm font-medium text-slate-900">{user?.expectedSalary || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Available Start</p>
                      <p className="text-sm font-medium text-slate-900">{user?.availableStart || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Willing to Relocate</p>
                      <p className="text-sm font-medium text-slate-900">{user?.willingToRelocate === true ? 'Yes' : user?.willingToRelocate === false ? 'No' : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Card 13: Availability (bottom) */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">Availability</h3>
                    <button
                      type="button"
                      onClick={() => setEditModal('availability')}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Availability Status</p>
                      <p className="text-sm font-medium text-slate-900">{user?.availabilityStatus || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Notice Period</p>
                      <p className="text-sm font-medium text-slate-900">{user?.noticePeriod || '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-slate-500">Open to</p>
                      <p className="text-sm font-medium text-slate-900">
                        {user?.openTo && user.openTo.length > 0 ? user.openTo.join(', ') : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit modals */}
                {editModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => { setEditingSkillLevel(null); setEditModal(null); }}
                  >
                    <div
                      className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => { setEditingSkillLevel(null); setEditModal(null); }}
                        className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {editModal === 'profile' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit profile</h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const parts = [firstName, middleName, lastName].filter(Boolean);
                              const fullName = suffix ? [...parts, suffix].join(' ').trim() : parts.join(' ').trim();
                              saveProfile({
                                firstName: firstName || undefined,
                                middleName: middleName || undefined,
                                lastName: lastName || undefined,
                                suffix: suffix || undefined,
                                pronoun: pronoun || undefined,
                                dateOfBirth: dateOfBirth || undefined,
                                nationality: nationality || undefined,
                                civilStatus: civilStatus || undefined,
                                bio: bio || undefined,
                                name: fullName || undefined,
                              });
                            }}
                            className="space-y-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>First name</label>
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Middle name (optional)</label>
                                <input type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Last name</label>
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Suffix</label>
                                <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} placeholder="e.g. Jr., Sr., III" className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Pronoun</label>
                                <select value={pronoun} onChange={(e) => setPronoun(e.target.value)} className={inputClass}>
                                  {PRONOUN_OPTIONS.map((o) => (
                                    <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className={labelClass}>Date of birth</label>
                                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Nationality</label>
                                <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Filipino" className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Civil status</label>
                                <select value={civilStatus} onChange={(e) => setCivilStatus(e.target.value)} className={inputClass}>
                                  {CIVIL_STATUS_OPTIONS.map((o) => (
                                    <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className={labelClass}>Short bio / About</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className={inputClass} placeholder="A short personal description" />
                              </div>
                            </div>
                            <p className="text-xs text-slate-500">Profile photo can be changed using the camera button on your avatar.</p>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'address' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Contact Information</h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveProfile({
                                mobileNumber: mobileNumber || undefined,
                                streetAddress: streetAddress || undefined,
                                city: city || undefined,
                                provinceState: provinceState || undefined,
                                country: country || undefined,
                                postalCode: postalCode || undefined,
                              });
                            }}
                            className="space-y-4"
                          >
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="sm:col-span-2">
                                <label className={labelClass}>Email Address</label>
                                <input type="email" value={user?.email ?? ''} disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className={labelClass}>Mobile Number</label>
                                <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="e.g. +63 912 345 6789" className={inputClass} />
                              </div>
                              <div className="sm:col-span-2">
                                <label className={labelClass}>Address</label>
                                <input type="text" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Street address" className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>City</label>
                                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Province / State</label>
                                <input type="text" value={provinceState} onChange={(e) => setProvinceState(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Country</label>
                                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Zip / Postal Code</label>
                                <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputClass} />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'jobPreferences' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Job Preferences</h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveProfile({
                                desiredJobTitle: desiredJobTitle || undefined,
                                jobCategory: jobCategory || undefined,
                                preferredIndustry: preferredIndustry || undefined,
                                employmentType: employmentType || undefined,
                                workSetup: workSetup || undefined,
                                expectedSalary: expectedSalary || undefined,
                                availableStart: availableStart || undefined,
                                willingToRelocate: willingToRelocate,
                              });
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Desired Job Title</label>
                              <input type="text" value={desiredJobTitle} onChange={(e) => setDesiredJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Job Category</label>
                              <select value={jobCategory} onChange={(e) => setJobCategory(e.target.value)} className={inputClass}>
                                {DEGREE_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Preferred Industry</label>
                              <input type="text" value={preferredIndustry} onChange={(e) => setPreferredIndustry(e.target.value)} placeholder="e.g. Software, Finance" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Employment Type</label>
                              <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} className={inputClass}>
                                {EMPLOYMENT_TYPE_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Work Setup</label>
                              <select value={workSetup} onChange={(e) => setWorkSetup(e.target.value)} className={inputClass}>
                                {WORK_SETUP_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Expected Salary</label>
                              <input type="text" value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. 50,000 - 70,000 PHP" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Available Start</label>
                              <input type="text" value={availableStart} onChange={(e) => setAvailableStart(e.target.value)} placeholder="e.g. Immediately, 2 weeks notice" className={inputClass} />
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id="willingToRelocate"
                                checked={willingToRelocate}
                                onChange={(e) => setWillingToRelocate(e.target.checked)}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="willingToRelocate" className="text-sm text-slate-700">Willing to Relocate</label>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'availability' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Availability</h3>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              saveProfile({
                                availabilityStatus: availabilityStatus || undefined,
                                noticePeriod: noticePeriod || undefined,
                                openTo,
                              });
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Availability Status</label>
                              <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value)} className={inputClass}>
                                {AVAILABILITY_STATUS_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className={labelClass}>Notice Period</label>
                              <input type="text" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} placeholder="e.g. 2 weeks, Immediately" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Open to</label>
                              <p className="mt-1 text-xs text-slate-500">Select all that apply (Freelance, Contract, Full-time, etc.)</p>
                              <div className="mt-2 flex flex-wrap gap-3">
                                {OPEN_TO_OPTIONS.map((opt) => (
                                  <label key={opt.value} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={openTo.includes(opt.value)}
                                      onChange={(e) => {
                                        if (e.target.checked) setOpenTo([...openTo, opt.value]);
                                        else setOpenTo(openTo.filter((v) => v !== opt.value));
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700">{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'social' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {socialEditIndex === null ? 'Add social link' : 'Edit social link'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!socialLabel.trim() || !socialUrl.trim()) return;
                              setSaving(true);
                              setMessage('');
                              setError('');
                              try {
                                const entry: SocialLinkEntry = { label: socialLabel.trim(), url: socialUrl.trim() };
                                const next = socialEditIndex === null
                                  ? [...socialLinks, entry]
                                  : socialLinks.map((item, i) => (i === socialEditIndex ? entry : item));
                                const updated = await api.users.updateMe({ socialLinks: next });
                                setUser(updated);
                                setSocialLinks(updated.socialLinks ?? []);
                                setMessage(socialEditIndex === null ? 'Link added.' : 'Link updated.');
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Label</label>
                              <input type="text" value={socialLabel} onChange={(e) => setSocialLabel(e.target.value)} placeholder="e.g. LinkedIn, GitHub, Portfolio" className={inputClass} required />
                            </div>
                            <div>
                              <label className={labelClass}>URL</label>
                              <input type="url" value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} placeholder="https://..." className={inputClass} required />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'professional' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {professionalEditIndex === null ? 'Add professional information' : 'Edit professional information'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!proTitle.trim() || !proOrganization.trim()) return;
                              setSaving(true);
                              setMessage('');
                              setError('');
                              try {
                                const entry: ProfessionalInfoEntry = {
                                  title: proTitle.trim(),
                                  organization: proOrganization.trim(),
                                  startDate: proStartDate.trim() || undefined,
                                  endDate: proEndDate.trim() || 'Present',
                                  description: proDescription.trim() || undefined,
                                };
                                const next = professionalEditIndex === null
                                  ? [...professionalInfo, entry]
                                  : professionalInfo.map((item, i) => (i === professionalEditIndex ? entry : item));
                                const updated = await api.users.updateMe({ professionalInfo: next });
                                setUser(updated);
                                setProfessionalInfo(updated.professionalInfo ?? []);
                                setMessage(professionalEditIndex === null ? 'Entry added.' : 'Entry updated.');
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Title</label>
                              <input type="text" value={proTitle} onChange={(e) => setProTitle(e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} required />
                            </div>
                            <div>
                              <label className={labelClass}>Organization</label>
                              <input type="text" value={proOrganization} onChange={(e) => setProOrganization(e.target.value)} placeholder="Company or organization name" className={inputClass} required />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>Start date</label>
                                <input type="date" value={proStartDate} onChange={(e) => setProStartDate(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>End date</label>
                                <input type="date" value={proEndDate} onChange={(e) => setProEndDate(e.target.value)} className={inputClass} />
                                <label className="mt-2 flex items-center gap-2">
                                  <input type="checkbox" checked={proEndDate === ''} onChange={(e) => { if (e.target.checked) setProEndDate(''); }} className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                                  <span className="text-xs text-slate-500">Currently working here (Present)</span>
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>Description (optional)</label>
                              <RichTextEditor value={proDescription} onChange={setProDescription} placeholder="Brief description of role or achievement" className="mt-1" />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'skills' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {editingSkillLevel === null ? 'Add skills' : 'Edit skills'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setError('');
                              const hasSkills = !!skillText.trim();
                              const hasLevel = !!skillLevel.trim();
                              if (!hasSkills && !hasLevel) return;
                              if (hasSkills && !hasLevel) {
                                setError('Skill Level is required when Skills are set.');
                                return;
                              }
                              if (!hasSkills && hasLevel) {
                                setError('Skills are required when Skill Level is set.');
                                return;
                              }
                              const level = skillLevel.trim() || undefined;
                              const newSkillNames = skillText.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
                              if (newSkillNames.length !== new Set(newSkillNames).size) {
                                setError('Duplicate skills in list. Remove repeated skill names.');
                                return;
                              }
                              const existingSkillNames = new Set<string>();
                              const editingLevel = editingSkillLevel ?? '';
                              for (const item of skills) {
                                if (editingSkillLevel !== null && (item.skillLevel || '').trim() === editingLevel) continue;
                                const sk = getEntrySkillsText(item);
                                sk.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).forEach((name) => existingSkillNames.add(name));
                              }
                              const duplicate = newSkillNames.find((name) => existingSkillNames.has(name));
                              if (duplicate) {
                                setError('Already added this skill');
                                return;
                              }
                              setSaving(true);
                              setMessage('');
                              try {
                                let next: SkillEntry[];
                                if (editingSkillLevel === null) {
                                  const existingIndex = skills.findIndex((e) => (e.skillLevel || '').trim() === (level || ''));
                                  if (existingIndex >= 0) {
                                    const existing = skills[existingIndex];
                                    const existingSkills = getEntrySkillsText(existing);
                                    const merged = existingSkills ? `${existingSkills}, ${skillText.trim()}` : skillText.trim();
                                    next = skills.map((item, i) => {
                                      const sk = getEntrySkillsText(item);
                                      return i === existingIndex ? { skills: merged, skillLevel: level } : { skills: sk, skillLevel: item.skillLevel ?? undefined };
                                    });
                                  } else {
                                    next = [...skills.map((item) => ({
                                      skills: getEntrySkillsText(item),
                                      skillLevel: item.skillLevel ?? undefined,
                                    })), { skills: skillText.trim(), skillLevel: level }];
                                  }
                                } else {
                                  next = skills
                                    .filter((e) => (e.skillLevel || '').trim() !== editingLevel)
                                    .map((e) => ({ skills: getEntrySkillsText(e), skillLevel: e.skillLevel ?? undefined }));
                                  next.push({ skills: skillText.trim(), skillLevel: level });
                                }
                                const updated = await api.users.updateMe({ skills: next });
                                setUser(updated);
                                setSkills(updated.skills ?? []);
                                setMessage(editingSkillLevel === null ? 'Skill added.' : 'Skill entry updated.');
                                setEditingSkillLevel(null);
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Skills</label>
                              <input type="text" value={skillText} onChange={(e) => setSkillText(e.target.value)} placeholder="e.g. JavaScript, React, Node.js, Communication, Leadership" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Skill Level</label>
                              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className={inputClass}>
                                {SKILL_LEVEL_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => { setEditingSkillLevel(null); setEditModal(null); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'education' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {educationEditIndex === null ? 'Add education' : 'Edit education'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              const schoolValue = eduSchool === 'Other' ? eduSchoolOther.trim() : eduSchool.trim();
                              if (!schoolValue) {
                                setError('Please select or specify School / University.');
                                return;
                              }
                              if (eduSchool === 'Other') {
                                const alreadyInOptions = schoolOptionsWithCustom.filter((o) => o !== 'Other').some(
                                  (opt) => opt.trim().toLowerCase() === schoolValue.toLowerCase()
                                );
                                if (alreadyInOptions) {
                                  setError('This school/university is already in the options. Please select it from the list instead.');
                                  return;
                                }
                              }
                              setError('');
                              setSaving(true);
                              setMessage('');
                              try {
                                const fieldOfStudyValue = eduFieldOfStudy === 'Other' ? (eduFieldOfStudyOther.trim() || undefined) : (eduFieldOfStudy.trim() || undefined);
                                if (eduFieldOfStudy === 'Other' && fieldOfStudyValue) {
                                  const staticFos = getFieldOfStudyOptions(eduDegree).filter((o) => o.value && o.value !== 'Other');
                                  const customFos = education
                                    .filter((e) => (e.degree || '').trim() === (eduDegree || '').trim())
                                    .map((e) => e.fieldOfStudy?.trim())
                                    .filter(Boolean);
                                  const allLabels = new Set([...staticFos.map((o) => o.label.toLowerCase()), ...customFos.map((s) => (s ?? '').toLowerCase())]);
                                  if (allLabels.has(fieldOfStudyValue.toLowerCase())) {
                                    setError('This field of study is already in the options. Please select it from the list instead.');
                                    return;
                                  }
                                }
                                const entry: EducationEntry = {
                                  schoolUniversity: schoolValue,
                                  degree: eduDegree.trim() || undefined,
                                  fieldOfStudy: fieldOfStudyValue,
                                  startYear: eduStartYear.trim() || undefined,
                                  endYear: eduEndPresent ? 'Present' : (eduEndYear.trim() || undefined),
                                  gpa: eduGpa.trim() || undefined,
                                  honorsAwards: eduHonorsAwards.trim() || undefined,
                                };
                                const next = educationEditIndex === null
                                  ? [...education, entry]
                                  : education.map((item, i) => (i === educationEditIndex ? entry : item));
                                const updated = await api.users.updateMe({ education: next });
                                setUser(updated);
                                setEducation(updated.education ?? []);
                                setMessage(educationEditIndex === null ? 'Education entry added.' : 'Education entry updated.');
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div className="space-y-1">
                              <label className={labelClass}>School / University</label>
                              <input
                                type="text"
                                value={eduSchool === 'Other' ? eduSchoolOther : (eduSchoolQuery.length > 0 ? eduSchoolQuery : eduSchool)}
                                onChange={(e) => (eduSchool === 'Other' ? setEduSchoolOther(e.target.value) : setEduSchoolQuery(e.target.value))}
                                placeholder={eduSchool === 'Other' ? 'Specify school / university' : 'Type to search choices…'}
                                className={inputClass}
                                autoComplete="off"
                              />
                              {eduSchool !== 'Other' && (() => {
                                const opts = schoolOptionsWithCustom.map((s) => ({ value: s, label: s }));
                                const q = eduSchoolQuery.trim().toLowerCase();
                                const matching = q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : [];
                                const showMatches = q.length > 0 && matching.length > 0;
                                const showNoMatches = q.length > 0 && matching.length === 0;
                                return (
                                  <>
                                    {showMatches && (
                                      <div className="mt-1 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-sm">
                                        {matching.map((opt) => (
                                          <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                              setEduSchool(opt.value);
                                              if (opt.value === 'Other') setEduSchoolOther('');
                                              else setEduSchoolOther('');
                                              setEduSchoolQuery('');
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                                          >
                                            <span>{opt.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {showNoMatches && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        No matching option found. Select <span className="font-semibold">Other</span> to type a specific school/university.
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                              {eduSchool === 'Other' && (
                                <p className="mt-1 text-xs text-slate-500">Use Other to add the specific school/university.</p>
                              )}
                            </div>
                            <div>
                              <label className={labelClass}>Degree</label>
                              <select
                                value={eduDegree}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setEduDegree(next);
                                  const opts = getFieldOfStudyOptions(next, eduFieldOfStudy);
                                  const valid = opts.some((o) => o.value === eduFieldOfStudy);
                                  if (!valid) { setEduFieldOfStudy(''); setEduFieldOfStudyOther(''); setEduFieldOfStudyQuery(''); }
                                }}
                                className={inputClass}
                              >
                                {DEGREE_OPTIONS.map((o) => (
                                  <option key={o.value || 'x'} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className={labelClass}>Field of Study</label>
                              <input
                                type="text"
                                value={eduFieldOfStudy === 'Other' ? eduFieldOfStudyOther : (eduFieldOfStudyQuery.length > 0 ? eduFieldOfStudyQuery : eduFieldOfStudy)}
                                onChange={(e) => (eduFieldOfStudy === 'Other' ? setEduFieldOfStudyOther(e.target.value) : setEduFieldOfStudyQuery(e.target.value))}
                                placeholder={eduFieldOfStudy === 'Other' ? 'Specify field of study' : 'Type to search choices…'}
                                className={inputClass}
                                disabled={!eduDegree}
                                autoComplete="off"
                              />
                              {eduFieldOfStudy !== 'Other' && (() => {
                                const staticOpts = getFieldOfStudyOptions(eduDegree, eduFieldOfStudy).filter((o) => o.value !== '');
                                const staticValues = new Set(staticOpts.map((o) => o.value));
                                const customFos = new Set<string>();
                                education.forEach((e) => {
                                  if ((e.degree || '').trim() !== (eduDegree || '').trim()) return;
                                  const f = e.fieldOfStudy?.trim();
                                  if (f && !staticValues.has(f)) customFos.add(f);
                                });
                                const opts = [...staticOpts, ...[...customFos].sort().map((s) => ({ value: s, label: s }))];
                                const q = eduFieldOfStudyQuery.trim().toLowerCase();
                                const matching = q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : [];
                                const showMatches = q.length > 0 && matching.length > 0;
                                const showNoMatches = q.length > 0 && matching.length === 0;
                                return (
                                  <>
                                    {showMatches && (
                                      <div className="mt-1 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-sm">
                                        {matching.map((opt) => (
                                          <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => {
                                              setEduFieldOfStudy(opt.value);
                                              if (opt.value === 'Other') setEduFieldOfStudyOther('');
                                              else setEduFieldOfStudyOther('');
                                              setEduFieldOfStudyQuery('');
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50"
                                          >
                                            <span>{opt.label}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                    {showNoMatches && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        No matching option found. Select <span className="font-semibold">Other</span> to type a specific field of study.
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                              {eduFieldOfStudy === 'Other' && (
                                <p className="mt-1 text-xs text-slate-500">Use Other to add the specific field of study.</p>
                              )}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>Start Date</label>
                                <input type="date" value={eduStartYear} onChange={(e) => setEduStartYear(e.target.value)} className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>End Date</label>
                                <input type="date" value={eduEndYear} onChange={(e) => setEduEndYear(e.target.value)} className={inputClass} disabled={eduEndPresent} />
                                <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                  <input type="checkbox" checked={eduEndPresent} onChange={(e) => { setEduEndPresent(e.target.checked); if (e.target.checked) setEduEndYear(''); }} className="rounded border-slate-300" />
                                  Present (currently studying / no end date)
                                </label>
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>GPA</label>
                              <input type="text" value={eduGpa} onChange={(e) => setEduGpa(e.target.value)} placeholder="e.g. 3.5" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Honors / Awards</label>
                              <input type="text" value={eduHonorsAwards} onChange={(e) => setEduHonorsAwards(e.target.value)} placeholder="e.g. Cum Laude, Dean's List" className={inputClass} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'certifications' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {certEditIndex === null ? 'Add certification' : 'Edit certification'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!certName.trim()) return;
                              setSaving(true);
                              setMessage('');
                              setError('');
                              try {
                                const entry: CertificationEntry = {
                                  certificationName: certName.trim(),
                                  issuingOrganization: certOrg.trim() || undefined,
                                  issueDate: certIssueDate.trim() || undefined,
                                  expirationDate: certExpDate.trim() || undefined,
                                  credentialId: certCredentialId.trim() || undefined,
                                  certificateUrl: certUrl.trim() || undefined,
                                };
                                const next = certEditIndex === null
                                  ? [...certifications, entry]
                                  : certifications.map((item, i) => (i === certEditIndex ? entry : item));
                                const updated = await api.users.updateMe({ certifications: next });
                                setUser(updated);
                                setCertifications(updated.certifications ?? []);
                                setMessage(certEditIndex === null ? 'Certification added.' : 'Certification updated.');
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Certification Name</label>
                              <input type="text" value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="e.g. AWS Solutions Architect" className={inputClass} required />
                            </div>
                            <div>
                              <label className={labelClass}>Issuing Organization</label>
                              <input type="text" value={certOrg} onChange={(e) => setCertOrg(e.target.value)} placeholder="e.g. Amazon Web Services" className={inputClass} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>Issue Date</label>
                                <input type="text" value={certIssueDate} onChange={(e) => setCertIssueDate(e.target.value)} placeholder="e.g. 2023-01" className={inputClass} />
                              </div>
                              <div>
                                <label className={labelClass}>Expiration Date</label>
                                <input type="text" value={certExpDate} onChange={(e) => setCertExpDate(e.target.value)} placeholder="e.g. 2026-01" className={inputClass} />
                              </div>
                            </div>
                            <div>
                              <label className={labelClass}>Credential ID</label>
                              <input type="text" value={certCredentialId} onChange={(e) => setCertCredentialId(e.target.value)} placeholder="e.g. ABC123XYZ" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Certificate (URL)</label>
                              <input type="url" value={certUrl} onChange={(e) => setCertUrl(e.target.value)} placeholder="https://... link to view certificate" className={inputClass} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                      {editModal === 'projects' && (
                        <>
                          <h3 className="mb-4 text-lg font-semibold text-slate-900">
                            {projectEditIndex === null ? 'Add project' : 'Edit project'}
                          </h3>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!projName.trim()) return;
                              setSaving(true);
                              setMessage('');
                              setError('');
                              try {
                                const entry: ProjectEntry = {
                                  projectName: projName.trim(),
                                  projectDescription: projDescription.trim() || undefined,
                                  technologiesUsed: projTechnologies.trim() || undefined,
                                  projectLink: projLink.trim() || undefined,
                                  repository: projRepository.trim() || undefined,
                                  demoScreenshotsUrl: projDemoUrl.trim() || undefined,
                                };
                                const next = projectEditIndex === null
                                  ? [...projects, entry]
                                  : projects.map((item, i) => (i === projectEditIndex ? entry : item));
                                const updated = await api.users.updateMe({ projects: next });
                                setUser(updated);
                                setProjects(updated.projects ?? []);
                                setMessage(projectEditIndex === null ? 'Project added.' : 'Project updated.');
                                setEditModal(null);
                              } catch (err) {
                                setError(err instanceof Error ? err.message : 'Failed to save');
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="space-y-4"
                          >
                            <div>
                              <label className={labelClass}>Project Name</label>
                              <input type="text" value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="e.g. E-commerce Dashboard" className={inputClass} required />
                            </div>
                            <div>
                              <label className={labelClass}>Project Description</label>
                              <textarea value={projDescription} onChange={(e) => setProjDescription(e.target.value)} placeholder="Brief description of the project..." className={inputClass} rows={3} />
                            </div>
                            <div>
                              <label className={labelClass}>Technologies Used</label>
                              <input type="text" value={projTechnologies} onChange={(e) => setProjTechnologies(e.target.value)} placeholder="e.g. React, Node.js, PostgreSQL" className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Project Link</label>
                              <input type="url" value={projLink} onChange={(e) => setProjLink(e.target.value)} placeholder="https://..." className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Repository</label>
                              <input type="url" value={projRepository} onChange={(e) => setProjRepository(e.target.value)} placeholder="https://github.com/..." className={inputClass} />
                            </div>
                            <div>
                              <label className={labelClass}>Demo / Screenshots (URL)</label>
                              <input type="url" value={projDemoUrl} onChange={(e) => setProjDemoUrl(e.target.value)} placeholder="https://... link to demo or screenshots" className={inputClass} />
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditModal(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
                              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">Save</button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
      </main>
    </div>
  );
}
