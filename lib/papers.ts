import fs from "fs";
import path from "path";

export type RelevantPaper = {
  id: string;
  type: string;
  title: string;
  authors: string | null;
  year: string | null;
  sortYear: number;
  venue: string | null;
  note: string | null;
  url: string | null;
  doi: string | null;
};

const PAPERS_PATH = path.join(process.cwd(), "data", "papers", "relevant.bib");

export function getRelevantPapers(): RelevantPaper[] {
  if (!fs.existsSync(PAPERS_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(PAPERS_PATH, "utf8");
  return splitEntries(raw)
    .map(parseEntry)
    .filter((paper): paper is RelevantPaper => paper !== null);
}

function splitEntries(raw: string): string[] {
  const entries: string[] = [];
  let index = 0;

  while (index < raw.length) {
    const atIndex = raw.indexOf("@", index);
    if (atIndex === -1) {
      break;
    }

    const braceIndex = raw.indexOf("{", atIndex);
    if (braceIndex === -1) {
      break;
    }

    let depth = 1;
    let inQuote = false;
    let cursor = braceIndex + 1;

    while (cursor < raw.length && depth > 0) {
      const char = raw[cursor];
      const prev = raw[cursor - 1];

      if (char === '"' && prev !== "\\") {
        inQuote = !inQuote;
      } else if (!inQuote) {
        if (char === "{") depth += 1;
        if (char === "}") depth -= 1;
      }

      cursor += 1;
    }

    entries.push(raw.slice(atIndex, cursor).trim());
    index = cursor;
  }

  return entries;
}

function parseEntry(entryRaw: string): RelevantPaper | null {
  const typeMatch = entryRaw.match(/^@([a-zA-Z]+)\s*\{/);
  if (!typeMatch) {
    return null;
  }

  const type = typeMatch[1].toLowerCase();
  const openIndex = entryRaw.indexOf("{");
  const content = entryRaw.slice(openIndex + 1, -1).trim();
  const keySeparator = findTopLevelComma(content);
  if (keySeparator === -1) {
    return null;
  }

  const id = content.slice(0, keySeparator).trim();
  const fields = parseFields(content.slice(keySeparator + 1));
  const title = normalizeValue(fields.title);
  if (!title) {
    return null;
  }

  const dateValue = normalizeValue(fields.year) || normalizeValue(fields.urldate);

  return {
    id,
    type,
    title,
    authors: formatAuthors(fields.author),
    year: formatDate(dateValue),
    sortYear: getSortYear(dateValue),
    venue: pickVenue(fields),
    note: normalizeValue(fields.note),
    url: normalizeValue(fields.url) || extractUrl(fields.howpublished),
    doi: normalizeValue(fields.doi),
  };
}

function parseFields(body: string): Record<string, string> {
  const fields: Record<string, string> = {};
  let index = 0;

  while (index < body.length) {
    while (index < body.length && /[\s,]/.test(body[index])) {
      index += 1;
    }

    if (index >= body.length) {
      break;
    }

    const nameStart = index;
    while (index < body.length && /[A-Za-z0-9_-]/.test(body[index])) {
      index += 1;
    }

    const fieldName = body.slice(nameStart, index).trim().toLowerCase();
    while (index < body.length && /\s/.test(body[index])) {
      index += 1;
    }

    if (body[index] !== "=") {
      while (index < body.length && body[index] !== ",") {
        index += 1;
      }
      continue;
    }

    index += 1;
    while (index < body.length && /\s/.test(body[index])) {
      index += 1;
    }

    const { value, nextIndex } = parseValue(body, index);
    if (fieldName) {
      fields[fieldName] = value;
    }
    index = nextIndex;
  }

  return fields;
}

function parseValue(input: string, start: number): { value: string; nextIndex: number } {
  const opener = input[start];

  if (opener === "{") {
    let depth = 1;
    let index = start + 1;

    while (index < input.length && depth > 0) {
      if (input[index] === "{") depth += 1;
      if (input[index] === "}") depth -= 1;
      index += 1;
    }

    return {
      value: input.slice(start, index),
      nextIndex: index,
    };
  }

  if (opener === '"') {
    let index = start + 1;

    while (index < input.length) {
      if (input[index] === '"' && input[index - 1] !== "\\") {
        index += 1;
        break;
      }
      index += 1;
    }

    return {
      value: input.slice(start, index),
      nextIndex: index,
    };
  }

  let index = start;
  while (index < input.length && input[index] !== ",") {
    index += 1;
  }

  return {
    value: input.slice(start, index),
    nextIndex: index,
  };
}

function findTopLevelComma(input: string): number {
  let depth = 0;
  let inQuote = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const prev = input[index - 1];

    if (char === '"' && prev !== "\\") {
      inQuote = !inQuote;
      continue;
    }

    if (inQuote) {
      continue;
    }

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (char === "," && depth === 0) {
      return index;
    }
  }

  return -1;
}

function normalizeValue(value?: string): string | null {
  if (!value) {
    return null;
  }

  let normalized = value.trim();

  while (
    (normalized.startsWith("{") && normalized.endsWith("}")) ||
    (normalized.startsWith('"') && normalized.endsWith('"'))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  normalized = normalized
    .replace(/\\url\{([^}]+)\}/g, "$1")
    .replace(/\\&/g, "&")
    .replace(/\\_/g, "_")
    .replace(/\\%/g, "%")
    .replace(/\\#/g, "#")
    .replace(/\\\$/g, "$")
    .replace(/\\o/g, "ø")
    .replace(/\\O/g, "Ø")
    .replace(/\\l/g, "ł")
    .replace(/\\L/g, "Ł")
    .replace(/\\['"`^~=\.uvHcdbkrt]\{?([A-Za-z])\}?/g, "$1")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

const MONTHS_NB = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.replace(/(\d{4})-(\d{2})-(\d{2})/g, (match, year, month, day) => {
    const monthName = MONTHS_NB[Number(month) - 1];
    if (!monthName) {
      return match;
    }

    return `${Number(day)}. ${monthName} ${year}`;
  });
}

function formatAuthors(value?: string): string | null {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return null;
  }

  const authors = normalized
    .split(/\s+and\s+/i)
    .map((author) => author.trim())
    .filter(Boolean);

  if (authors.length === 0) {
    return null;
  }

  if (authors.length === 1) {
    return authors[0];
  }

  return `${authors[0]} et al.`;
}

function pickVenue(fields: Record<string, string>): string | null {
  return (
    normalizeValue(fields.journal) ||
    normalizeValue(fields.booktitle) ||
    normalizeValue(fields.institution) ||
    normalizeValue(fields.organization) ||
    normalizeValue(fields.publisher) ||
    normalizeValue(fields.howpublished)
  );
}

function extractUrl(value?: string): string | null {
  const normalized = normalizeValue(value);
  if (!normalized) {
    return null;
  }

  const urlMatch = normalized.match(/https?:\/\/\S+/);
  return urlMatch ? urlMatch[0] : null;
}

function getSortYear(value: string | null): number {
  if (!value) {
    return 0;
  }

  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}
