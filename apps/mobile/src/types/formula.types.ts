export interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
}

export interface Formula {
  id: string;
  subjectId: string;
  chapter: string;
  title: string;
  latex: string;
  plain: string;
  importance: number;
  uses: number;
  explanation?: string;
  variables?: FormulaVariable[];
}
