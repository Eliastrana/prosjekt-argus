export const explanationLevels = [
  { id: "child", label: "Forklar som til et barn" },
  { id: "everyday", label: "Forklar uten teknisk bakgrunn" },
  { id: "technical", label: "Forklar med tekniske detaljer" },
  { id: "expert", label: "Forklar som til en fagperson" },
] as const;

export type ExplanationLevel = (typeof explanationLevels)[number]["id"];
