import { getField, getFields, getSubfield, searchEditionsBNF } from "@/services/apiBNF";
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
export async function fetchEditions(book: BookOverview): Promise<{ editions: Edition[], countEditions: number, currentEdition: Edition | undefined }> {
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
    // ISBN
    let isbn: string = String(getSubfield(getField(record, "010"), "a"));
    let isbn_10 = undefined;
    let isbn_13 = undefined;

    isbn = isbn.replace(/-/g, "");

    // Vérifier la validité
    if (isbn.length == 10) {
      if (isbn.startsWith("2")) {
        isbn_10 = isbn;
      }
    } else if (isbn.length == 13) {
      if (isbn.startsWith("978") || isbn.startsWith("979")) {
        isbn_13 = isbn;
      }
    }

    // Date de publication
    const publicationRaw = String(
      getSubfield(getField(record, "214"), "d") ??
      getSubfield(getField(record, "210"), "d"),
    );
    const publication = publicationRaw ? publicationRaw.replace(/\D/g, "") : undefined;

    // Nombre de pages
    const pagination = String(getSubfield(getField(record, "215"), "a"));
    const matchPagination = pagination.match(/(\d+)\s*(?:p\.|pages?)/i);

    // Format
    var format = getSubfield(getField(record, "010"), "b");
    format = format.replace(/br./i, 'Broché')
    format = format.replace(/rel./i, 'Relié')

    // Traduction et illustration
    var translators: string[] = []
    var illustrators: string[] = []
    for (const tag of ["700", "701", "702", "703", "710", "711", "712"]) {
      for (const field of getFields(record, tag)) {
        const role = getSubfield(field, "4");

        // 730 = traducteur 
        if (role == 730) {
          const lastName = getSubfield(field, "a") || "";
          const firstName = getSubfield(field, "b") || "";
          const translator = `${firstName} ${lastName}`.trim();

          if (translator) {
            translators.push(translator);
          }
        }
        // 440 = illustrateur
        else if (role == 440) {
          const lastName = getSubfield(field, "a") || "";
          const firstName = getSubfield(field, "b") || "";
          const illustrator = `${firstName} ${lastName}`.trim();

          if (illustrator) {
            illustrators.push(illustrator);
          }
        }
      }
    }

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
      summary: getSubfield(getField(record, "330"), "a"),
      infos: {
        publication,
        publisher:
          getSubfield(getField(record, "214"), "c") ??
          getSubfield(getField(record, "210"), "c"),
        collection: getSubfield(getField(record, "225"), "i"),
        pages: matchPagination ? Number(matchPagination[1]) : undefined,
        format,
        translators,
        illustrators,
        vo_title: getSubfield(getField(record, "454"), "t")
      },

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

  return ({ editions: BNFEditions, countEditions: countEditions, currentEdition: newCurrentEdition })
}