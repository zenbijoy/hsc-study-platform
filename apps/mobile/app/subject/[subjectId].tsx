import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { SubjectScreen } from '@/src/features/subjects/screens/SubjectScreen';

export default function SubjectRoute() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const validSubjectId = typeof subjectId === 'string' ? subjectId.trim() : '';

  return <SubjectScreen subjectId={validSubjectId} />;
}
