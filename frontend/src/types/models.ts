// src/types/Model.ts
interface Model {
  _id: string;
}

export type SynonymEntry = {
  explanation: string;
  synonyms: string[];
}

export type Synonym = Model & {
  word: string;
  entries : SynonymEntry[];
  created_at: Date;
  updated_at?: Date | null;
};

export type Explanation = Model & {
  word: string;
  explanation: string;
  created_at: Date | null;
  updated_at?: Date | null;
};
