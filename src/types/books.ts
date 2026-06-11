export type BookCandidate = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  isbn?: string;
  series_name?: string;
  series_position?: string;
  source: "openlibrary" | "bnf";
}

export type Book = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  series_name?: string;
  series_position?: string;
  isbn?: string;
  // cover_id?: string;
  source: "openlibrary" | "bnf" | "both";
};