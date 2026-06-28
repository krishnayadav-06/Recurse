export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  patterns: string[];
}

export interface UserStatus {
  problem_id: string;
  reps: number;
}

export type SortField = "title" | "difficulty";
export type SortDir = "asc" | "desc";
