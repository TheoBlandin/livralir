export type BookCandidate = {
  isbn_10?: string;
  isbn_13?: string;
  title?: string;
  subtitle?: string;
  authors?: string[];
  series_name?: string;
  series_position?: string;
  cover_id?: string;
  source: "openlibrary" | "bnf";
};

export type ISBN = {
  isbn_10: {
    value?: string;
    source: "openlibrary" | "bnf" | "both";
  };
  isbn_13: {
    value?: string;
    source: "openlibrary" | "bnf" | "both";
  };
};

export type Cover = {
  small: string;
  medium: string;
  large: string;
};

export type Work = {
  isbn: ISBN[];
  title?: string;
  subtitle?: string;
  authors?: string[];
  series_name?: string;
  series_position?: string;
  cover?: Cover;
  source: "openlibrary" | "bnf" | "both";
};
