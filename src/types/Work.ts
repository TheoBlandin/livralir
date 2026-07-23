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

// export type ISBN = {
//   isbn_10: {
//     value?: string;
//     source: "openlibrary" | "bnf" | "both";
//     id: {
//       openLibrary?: string;
//       bnf?: string;
//     };
//   };
//   isbn_13: {
//     value?: string;
//     source: "openlibrary" | "bnf" | "both";
//     id: {
//       openLibrary?: string;
//       bnf?: string;
//     };
//   };
// };

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
  pages?: number;
  publisher?: string;
  date?: string;
  summary?: string;
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
