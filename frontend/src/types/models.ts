// src/types/Model.ts
interface Model {
  _id: string;
}

export type ExplanationEntry = {
  explanation: string;
  synonyms: string[];
};

export type Explanation = Model & {
  word: string;
  entries: ExplanationEntry[];
  created_at: Date;
  updated_at?: Date | null;
};

export type CreateSynonymDTO = {
  word: string;
};
