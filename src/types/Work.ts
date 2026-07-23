export type BookCandidate = {
  isbn_10?: string;
  isbn_13?: string;
  title?: string;
  subtitle?: string;
  authors?: string[];
  series_name?: string;
  series_position?: string;
  source: "openlibrary" | "bnf";
  id: string;
};

export type Cover = {
  small: string;
  medium: string;
  large: string;
};

export type Edition = {
  id: {
    openLibrary?: string;
    bnf?: string;
  };
  isbn: {
    isbn_10?: string;
    isbn_13?: string;
  };
  cover?: Cover;
  summary?: string;
  infos: {
    publication?: string;
    publisher?: string;
    collection?: string;
    pages?: number;
    format?: string;
    illustrators?: string[];
    translators?: string[];
    first_publication?: string;
    country?: string;
    vo_title?: string
  }
};

export type BookOverview = {
  title?: string;
  subtitle?: string;
  authors?: string[];
  series_name?: string;
  series_position?: string;
  current_edition: Edition;
  editions: Edition[];
  source: "openlibrary" | "bnf" | "both";
};
