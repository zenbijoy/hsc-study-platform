/**
 * Controlled Subject Themes
 * 
 * Maps backend `themeKey` to approved token sets.
 * Prevents arbitrary unvetted hex colors from breaking UI styling.
 */

export interface SubjectTheme {
  key: string;
  nameEn: string;
  nameBn: string;
  primary: string;
  accent: string;
  gradient: [string, string, string];
  tintBg: string;
  icon: string;
}

export const subjectThemes: Record<string, SubjectTheme> = {
  physics: {
    key: 'physics',
    nameEn: 'Physics',
    nameBn: 'পদার্থবিজ্ঞান',
    primary: '#6CB7FF',
    accent: '#3B82F6',
    gradient: ['#17385E', '#10243C', '#071018'],
    tintBg: 'rgba(108, 183, 255, 0.12)',
    icon: 'planet-outline',
  },
  chemistry: {
    key: 'chemistry',
    nameEn: 'Chemistry',
    nameBn: 'রসায়ন',
    primary: '#57E0B7',
    accent: '#10B981',
    gradient: ['#124438', '#0C2A23', '#071018'],
    tintBg: 'rgba(87, 224, 183, 0.12)',
    icon: 'flask-outline',
  },
  mathematics: {
    key: 'mathematics',
    nameEn: 'Higher Math',
    nameBn: 'উচ্চতর গণিত',
    primary: '#A58BFF',
    accent: '#8B5CF6',
    gradient: ['#2E1E5E', '#1D133D', '#071018'],
    tintBg: 'rgba(165, 139, 255, 0.12)',
    icon: 'calculator-outline',
  },
  biology: {
    key: 'biology',
    nameEn: 'Biology',
    nameBn: 'জীববিজ্ঞান',
    primary: '#FF8A76',
    accent: '#F43F5E',
    gradient: ['#4E211A', '#321510', '#071018'],
    tintBg: 'rgba(255, 138, 118, 0.12)',
    icon: 'leaf-outline',
  },
  ict: {
    key: 'ict',
    nameEn: 'ICT',
    nameBn: 'আইসিটি',
    primary: '#38BDF8',
    accent: '#0284C7',
    gradient: ['#153A52', '#0E2333', '#071018'],
    tintBg: 'rgba(56, 189, 248, 0.12)',
    icon: 'hardware-chip-outline',
  },
};

const defaultSubjectTheme: SubjectTheme = subjectThemes.physics!;

export function resolveSubjectTheme(themeKey?: string): SubjectTheme {
  if (!themeKey) return defaultSubjectTheme;
  const normalized = themeKey.toLowerCase().trim();
  return subjectThemes[normalized] || defaultSubjectTheme;
}
