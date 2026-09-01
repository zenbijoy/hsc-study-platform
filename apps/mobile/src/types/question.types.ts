export interface MCQQuestion {
  id: string;
  subjectId: string;
  chapter: string;
  question: string;
  banglaQuestion?: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  board?: string;
  year?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CQSubQuestion {
  letter: 'a' | 'b' | 'c' | 'd';
  banglaLetter: 'ক' | 'খ' | 'গ' | 'ঘ';
  question: string;
  marks: number;
  solution: string;
}

export interface CQQuestion {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  stimulus: string;
  subQuestions: CQSubQuestion[];
  board?: string;
  year?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
