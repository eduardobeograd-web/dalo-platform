export type DestinationFaq = {
  question: string;
  answer: string;
};

export function slugifyDestination(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseDestinationFaq(value: unknown): DestinationFaq[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const question =
        "question" in item && typeof item.question === "string"
          ? item.question.trim()
          : "";
      const answer =
        "answer" in item && typeof item.answer === "string"
          ? item.answer.trim()
          : "";

      return question && answer ? { question, answer } : null;
    })
    .filter((item): item is DestinationFaq => Boolean(item));
}
