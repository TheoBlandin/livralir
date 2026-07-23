/*
Fonctions utiles pour la fusion des résultats de recherche entre la BNF et OpenLibrary
*/
import { BookCandidate, BookOverview, Cover, Edition } from "@/types/Work";

interface MatchResult {
  score: number;
  titleScore: number;
  authorScore: number;
}

/**
 * Normalise une chaîne de caractère
 * @param {string} value Chaîne de caractère a normaliser
 * @returns {string} Chaîne de caractère normalisé
 */
function normalizeText(value: string): string {
  if (typeof value !== "string") {
    console.error("normalizeText reçu :", value, typeof value);
  }

  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Transforme une chaîne de caractère en tableau de chaînes de caractères
 * @param {string} text Chaîne de caractère
 * @returns {string[]} Tableau de chaînes de caractères
 */
function tokenize(text: string): string[] {
  return normalizeText(text).split(" ").filter(Boolean); // filter(Boolean) permet de supprimer les éléments vides
}

/**
 * Calcule la similarité entre deux tableaux de chaînes de caractères (https://fr.wikipedia.org/wiki/Indice_et_distance_de_Jaccard)
 * @param {string[]} aTokens Tableau de chaînes de caractères à comparer
 * @param {string[]} bTokens Tableau de chaînes de caractères à comparer
 * @returns {number} Indice de similarité, entre 0 et 1 où 1 indique deux chaînes de caractères identiques
 */
function jaccardSimilarity(aTokens: string[], bTokens: string[]): number {
  const a = new Set(aTokens);
  const b = new Set(bTokens);

  const intersection = [...a].filter((x) => b.has(x)).length;

  const union = new Set([...a, ...b]).size;

  return union === 0 ? 0 : intersection / union;
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes de caractères (https://fr.wikipedia.org/wiki/Distance_de_Levenshtein)
 * @param {string} a Chaîne de caractère à comparer
 * @param {string} b Chaîne de caractère à comparer
 * @returns {number} Nombre d'opérations à effectuer pour transformer a en b
 */
function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, () =>
    new Array(a.length + 1).fill(0),
  );

  for (let i = 0; i <= b.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calcule la distance normalisé de Levenshtein
 * @param {string} a Chaîne de caractère à comparer
 * @param {string} b Chaîne de caractère à comparer
 * @returns Distance de Levenshtein, normalisé sur une échelle de 0 à 1 où 1 indique deux chaînes de caractères identiques
 */
function normalizedLevenshtein(a: string, b: string): number {
  const dist = levenshtein(a, b);

  const maxLength = Math.max(a.length, b.length);

  if (maxLength === 0) {
    return 1;
  }

  return 1 - dist / maxLength;
}

/**
 * Compare les titres de deux livres
 * @param {string} titleA Titre du premier livre à comparer
 * @param {string} titleB Titre du second livre à comparer
 * @returns {number} Taux de similarité entre deux titres, sur une échelle de 0 à 1 où 1 indique deux titres identiques
 */
function titleSimilarity(titleA: string, titleB: string): number {
  const a = normalizeText(titleA);
  const b = normalizeText(titleB);

  const tokenScore = jaccardSimilarity(tokenize(a), tokenize(b));

  const textScore = normalizedLevenshtein(a, b);

  return tokenScore * 0.4 + textScore * 0.6;
}

/**
 * Compare les listes d'auteurs de deux livres
 * @param {string[]} authorsA Tableaux des auteurs du premier livre à comparer
 * @param {string[]} authorsB Tableaux des auteurs du second livre à comparer
 * @returns
 */
function authorSimilarity(authorsA: string[], authorsB: string[]): number {
  if (authorsA.length === 0 || authorsB.length === 0) {
    return 0;
  }
  let best = 0;

  for (const a of authorsA) {
    for (const b of authorsB) {
      const score = normalizedLevenshtein(normalizeText(a), normalizeText(b));

      best = Math.max(best, score);
    }
  }

  return best;
}

/**
 * Compare les ISBN-10 et ISBN-13 de deux livres pour savoir si ce sont les mêmes
 * @param {isbn_10: string | undefined; isbn_13: string | undefined} isbnA ISBN-10 et ISBN-13 du premier livre à comparer
 * @param {isbn_10: string | undefined; isbn_13: string | undefined} isbnB Ensemble des ISBN-10 et ISBN-13 du second livre à comparer, qui est potentiellement déjà une fusion de livres
 * @returns True si même livre, false sinon
 */
function ISBNMatch(
  isbnA: { isbn_10: string | undefined; isbn_13: string | undefined },
  editionsBArray: Edition[],
): boolean {
  let match = false;

  for (const edition of editionsBArray) {
    if (!match) {
      match =
        (isbnA.isbn_10 == edition.isbn.isbn_10 &&
          isbnA.isbn_10 != undefined &&
          edition.isbn.isbn_10 != undefined) ||
        (isbnA.isbn_13 == edition.isbn.isbn_13 &&
          isbnA.isbn_13 != undefined &&
          edition.isbn.isbn_13 != undefined);
    }
  }

  return match;
}

/**
 * Compare deux livres via leurs titres et leurs auteurs
 * @param {BookCandidate} a Premier livre à comparer
 * @param {BookOverview} b Second livre à comparer
 * @returns {MatchResult} Résultat de la comparaison
 */
function computeMatchScore(a: BookCandidate, b: BookOverview): MatchResult {
  const titleScore = titleSimilarity(a.title ?? "", b.title ?? "");

  const authorScore = authorSimilarity(a.authors ?? [], b.authors ?? []);

  const score = titleScore * 0.7 + authorScore * 0.3;

  return {
    score,
    titleScore,
    authorScore,
  };
}

/**
 * Cherche dans la liste des livres existants une correspondance avec le livre candidat
 * @param {BookCandidate} candidate Livre candidat
 * @param {BookCandidate[]} existing Liste des livres existants
 * @returns {match: BookCandidate | null, score: number} Meilleur candidat et score de correspondance
 */
function findBestMatch(candidate: BookCandidate, existing: BookOverview[]) {
  let bestMatch: BookOverview | null = null;

  let bestScore = 0;

  for (const book of existing) {
    if (bestScore != 1) {
      if (
        ISBNMatch(
          { isbn_10: candidate.isbn_10, isbn_13: candidate.isbn_13 },
          book.editions,
        )
      ) {
        bestScore = 1;
        bestMatch = book;
      } else {
        const result = computeMatchScore(candidate, book);

        if (result.score > bestScore) {
          bestScore = result.score;
          bestMatch = book;
        }
      }
    }
  }

  return {
    match: bestMatch,
    score: bestScore,
  };
}

/**
 * Créé un nouveau objet Book à partir d'un candidat
 * @param {BookCandidate} candidate Livre candidat à partir duquel un nouveau livre est créé
 * @param {"openlibrary" | "bnf"} source Source du nouveau livre
 * @returns {BookOverview} Nouveau livre créé
 */
function createBook(candidate: BookCandidate): BookOverview {
  const edition = {
    id: {
      openLibrary: candidate.source == "openlibrary" ? candidate.id : undefined,
      bnf: candidate.source == "bnf" ? candidate.id : undefined,
    },
    isbn: {
      isbn_10: candidate.isbn_10,
      isbn_13: candidate.isbn_13,
    },
    cover:
      (candidate.isbn_10 ?? candidate.isbn_13)
        ? {
            small:
              "https://covers.openlibrary.org/b/isbn/" +
              (candidate.isbn_10 ?? candidate.isbn_13) +
              "-S.jpg?default=false",
            medium:
              "https://covers.openlibrary.org/b/isbn/" +
              (candidate.isbn_10 ?? candidate.isbn_13) +
              "-M.jpg?default=false",
            large:
              "https://covers.openlibrary.org/b/isbn/" +
              (candidate.isbn_10 ?? candidate.isbn_13) +
              "-L.jpg?default=false",
          }
        : undefined,
  };

  return {
    title: candidate.title,
    subtitle: candidate.subtitle,
    authors: [...(candidate.authors ?? [])],
    series_name: candidate.series_name,
    series_position: candidate.series_position,
    current_edition: edition,
    editions: [
      edition
    ],
    source: candidate.source,
  };
}

/**
 * Fusionne un livre existant avec le livre candidat
 * @param {BookOverview} existing Livre déjà existant
 * @param {BookCandidate} candidate Livre candidat
 * @param source
 */
function mergeBook(existing: BookOverview, candidate: BookCandidate) {
  // Fusionner les sources
  if (existing.source != "both" && existing.source != candidate.source) {
    existing.source = "both";
  }

  // Fusionner les éditions
  const match = existing.editions.find((item) => {
    const same10 = candidate.isbn_10 && item.isbn.isbn_10 === candidate.isbn_10;
    const same13 = candidate.isbn_13 && item.isbn.isbn_13 === candidate.isbn_13;

    return same10 || same13;
  });

  if (match) {
    // correspondance trouvée
    if (candidate.isbn_10) {
      // ISBN-10 définit dans candidat
      if (match.isbn.isbn_10 === candidate.isbn_10) {
        // ISBN-10 présents dans les deux
      } else if (!match.isbn.isbn_10) {
        // ISBN-10 manquant dans l'existant
        match.isbn.isbn_10 = candidate.isbn_10;
      }
    }

    if (candidate.isbn_13) {
      // ISBN-13 définit dans candidat
      if (match.isbn.isbn_13 === candidate.isbn_13) {
        // ISBN-13 présents dans les deux
      } else if (!match.isbn.isbn_13) {
        // ISBN-13 manquant dans l'existant
        match.isbn.isbn_13 = candidate.isbn_13;
      }
    }
  } else {
    // pas de correspondance, on créé un nouvel objet
    const newEdition: Edition = {
      id: {
        openLibrary:
          candidate.source == "openlibrary" ? candidate.id : undefined,
        bnf: candidate.source == "bnf" ? candidate.id : undefined,
      },
      isbn: {
        isbn_10: candidate.isbn_10,
        isbn_13: candidate.isbn_13,
      },
      cover:
        (candidate.isbn_10 ?? candidate.isbn_13)
          ? {
              small:
                "https://covers.openlibrary.org/b/isbn/" +
                (candidate.isbn_10 ?? candidate.isbn_13) +
                "-S.jpg?default=false",
              medium:
                "https://covers.openlibrary.org/b/isbn/" +
                (candidate.isbn_10 ?? candidate.isbn_13) +
                "-M.jpg?default=false",
              large:
                "https://covers.openlibrary.org/b/isbn/" +
                (candidate.isbn_10 ?? candidate.isbn_13) +
                "-L.jpg?default=false",
            }
          : undefined,
    };

    existing.editions.push(newEdition);
  }

  // Fusionner les infos de séries
  if (!existing.series_name && candidate.series_name) {
    // Nom de la série manquant dans l'existant mais définit dans le candidat
    existing.series_name = candidate.series_name;
  }
  if (!existing.series_position && candidate.series_position) {
    // Position dans la série manquant dans l'existant mais définit dans le candidat
    existing.series_position = candidate.series_position;
  }

  // existing.authors = [
  //   ...new Set([
  //     ...existing.authors,
  //     ...candidate.authors
  //   ])
  // ];
}

/**
 * Insère dans la liste des livres existants un nouveau livre, soit en le fusionnant avec un livre existant via mergeBook(), soit en créant une nouvelle entrée via createBook()
 * @param {BookOverview[]} catalog Liste des livres existants
 * @param {BookCandidate} candidate Nouveau livre à insérer
 */
export function insertBook(catalog: BookOverview[], candidate: BookCandidate) {
  const result = findBestMatch(candidate, catalog);

  if (result.match && result.score >= 0.9) {
    const index = catalog.indexOf(result.match);

    mergeBook(catalog[index], candidate);
  } else {
    catalog.push(createBook(candidate));
  }
}
