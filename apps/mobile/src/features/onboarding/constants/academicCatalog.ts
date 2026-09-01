import {
  AcademicYearOption,
  EducationBoardOption,
  StudentGroupOption,
  StudyFocus,
} from '../types/onboarding.types';

export const ACADEMIC_YEARS: AcademicYearOption[] = [
  { year: 2026, labelEn: 'HSC 2026', labelBn: 'এইচএসসি ২০২৬', isCurrent: true },
  { year: 2027, labelEn: 'HSC 2027', labelBn: 'এইচএসসি ২০২৭', isCurrent: false },
  { year: 2028, labelEn: 'HSC 2028', labelBn: 'এইচএসসি ২০২৮', isCurrent: false },
  { year: 2025, labelEn: 'HSC 2025 (Special)', labelBn: 'এইচএসসি ২০২৫', isCurrent: false },
];

export const STUDENT_GROUPS: StudentGroupOption[] = [
  {
    id: 'science',
    nameEn: 'Science',
    nameBn: 'বিজ্ঞান বিভাগ',
    description: 'Physics, Chemistry, Higher Math, Biology, and ICT.',
    isAvailable: true,
    icon: 'flask',
  },
  {
    id: 'business',
    nameEn: 'Business Studies',
    nameBn: 'ব্যবসায় শিক্ষা',
    description: 'Accounting, Finance, and Business Organization.',
    isAvailable: false,
    icon: 'briefcase',
  },
  {
    id: 'humanities',
    nameEn: 'Humanities',
    nameBn: 'মানবিক বিভাগ',
    description: 'Economics, Civics, Logic, and Social Work.',
    isAvailable: false,
    icon: 'book',
  },
];

export const EDUCATION_BOARDS: EducationBoardOption[] = [
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা বোর্ড', isGeneral: true },
  { id: 'chattogram', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম বোর্ড', isGeneral: true },
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী বোর্ড', isGeneral: true },
  { id: 'cumilla', nameEn: 'Cumilla', nameBn: 'কুমিল্লা বোর্ড', isGeneral: true },
  { id: 'jashore', nameEn: 'Jashore', nameBn: 'যশোর বোর্ড', isGeneral: true },
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল বোর্ড', isGeneral: true },
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট বোর্ড', isGeneral: true },
  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর বোর্ড', isGeneral: true },
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ বোর্ড', isGeneral: true },
  { id: 'madrasah', nameEn: 'Madrasah', nameBn: 'মাদ্রাসা বোর্ড', isGeneral: false },
  { id: 'technical', nameEn: 'Technical', nameBn: 'কারিগরি বোর্ড', isGeneral: false },
];

export const SCIENCE_SUBJECTS = [
  { id: 'physics', nameEn: 'Physics', nameBn: 'পদার্থবিজ্ঞান', isMandatory: true },
  { id: 'chemistry', nameEn: 'Chemistry', nameBn: 'রসায়ন', isMandatory: true },
  { id: 'mathematics', nameEn: 'Higher Math', nameBn: 'উচ্চতর গণিত', isMandatory: false },
  { id: 'biology', nameEn: 'Biology', nameBn: 'জীববিজ্ঞান', isMandatory: false },
  { id: 'ict', nameEn: 'ICT', nameBn: 'আইসিটি', isMandatory: true },
];

export const STUDY_FOCUS_OPTIONS: { id: StudyFocus; labelEn: string; labelBn: string; icon: string }[] = [
  { id: 'textbooks', labelEn: 'Textbook Reading', labelBn: 'মূল বই পড়া', icon: 'book-outline' },
  { id: 'formulas', labelEn: 'Formula Vault & Cheat Sheets', labelBn: 'সূত্র ও সমীকরণ রিভিশন', icon: 'calculator-outline' },
  { id: 'board_cq', labelEn: 'Board CQ Analysis', labelBn: 'বোর্ড সৃজনশীল প্রশ্ন', icon: 'document-text-outline' },
  { id: 'mcq_practice', labelEn: 'MCQ Practice Sprints', labelBn: 'বহুনির্বাচনী অনুশীলন', icon: 'checkbox-outline' },
  { id: 'revision', labelEn: 'Quick Exam Revision', labelBn: 'দ্রুত ফাইনাল রিভিশন', icon: 'flash-outline' },
];

export const DAILY_GOALS = [
  { minutes: 15, label: '15 mins / day', sub: 'Casual' },
  { minutes: 30, label: '30 mins / day', sub: 'Recommended' },
  { minutes: 60, label: '60 mins / day', sub: 'Intensive' },
];
