import { getField, getSubfield, searchEditionsBNF } from "@/services/apiBNF";
import { BookOverview, Edition } from "@/types/Work";

/**
 * Interroge l'API de la BNF avec le nom et les auteurs d'un livre pour en trouver ses différentes éditions
 * @param {BookOverview} book - Livre dont il faut chercher les éditions
 * @returns {{
 *   editions: Edition[],
 *   countEditions: number,
 *   currentEdition: Edition | undefined
 * }} Objet comportant les éditions receuillies, le nombre d'éditions au total et l'édition actuelle
 */
export async function fetchEditions(book: BookOverview): Promise<{ editions: Edition[], countEditions: number, currentEdition: Edition | undefined}> {
    var newCurrentEdition = undefined;

    // Appeler l'API de la BNF et récupérer le résultat
    const resultBNF = await searchEditionsBNF(
      book!.title ?? "",
      book!.authors ?? [],
    );
    const rawRecords =
      resultBNF["srw:searchRetrieveResponse"]?.["srw:records"]?.["srw:record"];
    const records = Array.isArray(rawRecords)
      ? rawRecords
      : rawRecords
        ? [rawRecords]
        : [];

    // Nombre d'éditions trouvées
    const countEditions =
      resultBNF["srw:searchRetrieveResponse"]?.["srw:numberOfRecords"];
    
    const BNFEditions: Edition[] = [];
    let count: number = 0;
    // Parcours des éditions pour construire des objets Edition
    for (const record of records) {
      let isbn: string = String(getSubfield(getField(record, "010"), "a"));
      let isbn_10 = undefined;
      let isbn_13 = undefined;

      isbn = isbn.replace(/-/g, "");

      if (isbn.length == 10) {
        if (isbn.startsWith("2")) {
          isbn_10 = isbn;
        }
      } else if (isbn.length == 13) {
        if (isbn.startsWith("978") || isbn.startsWith("979")) {
          isbn_13 = isbn;
        }
      }

      const pagination = String(getSubfield(getField(record, "215"), "a"));
      const matchPagination = pagination.match(/(\d+)\s*(?:p\.|pages?)/i);

      const dateRaw = String(
        getSubfield(getField(record, "214"), "d") ??
          getSubfield(getField(record, "210"), "d"),
      );
      const date = dateRaw ? dateRaw.replace(/\D/g, "") : undefined;

      const edition: Edition = {
        id: {
          bnf: record["srw:recordData"]["mxc:record"]["@_id"],
        },
        isbn: {
          isbn_10,
          isbn_13,
        },
        cover:
          (isbn_10 ?? isbn_13)
            ? {
                small:
                  "https://covers.openlibrary.org/b/isbn/" +
                  (isbn_10 ?? isbn_13) +
                  "-S.jpg?default=false",
                medium:
                  "https://covers.openlibrary.org/b/isbn/" +
                  (isbn_10 ?? isbn_13) +
                  "-M.jpg?default=false",
                large:
                  "https://covers.openlibrary.org/b/isbn/" +
                  (isbn_10 ?? isbn_13) +
                  "-L.jpg?default=false",
              }
            : undefined,
        pages: matchPagination ? Number(matchPagination[1]) : undefined,
        publisher:
          getSubfield(getField(record, "214"), "c") ??
          getSubfield(getField(record, "210"), "c"),
        date,
        summary: getSubfield(getField(record, "330"), "a")
      };
      BNFEditions.push(edition);

      // Retrouver l'édition originelle du livre transmis via identification ISBN
      if (
        book.editions[0].isbn.isbn_10 == edition.isbn.isbn_10 ||
        book.editions[0].isbn.isbn_13 == edition.isbn.isbn_13
      ) {
        newCurrentEdition = edition;
      }

      count++;
    }

    return ({ editions: BNFEditions, countEditions: countEditions, currentEdition: newCurrentEdition})
  }