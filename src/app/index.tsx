import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getField,
  getFields,
  getSubfield,
  searchBookBNF,
} from "@/services/apiBNF";

import Book from "@/components/Book";
import Searchbar from "@/components/Searchbar";
import TextComponent from "@/components/Text";
import { Colors } from "@/constants/Colors";
import { searchBookOpenLibrary } from "@/services/apiOpenLibrary";
import { BookCandidate, Work } from "@/types/Work";
import { insertBook } from "@/utils/mergeBooksResults";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [BNFBooks, setBNFBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [openLibraryBooks, setOpenLibraryBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [catalog, setCatalog] = useState<Work[]>([]);

  const insets = useSafeAreaInsets();

  async function fetchResult() {
    const newCatalog: Work[] = [];

    // OpenLibrary
    const resultOpenLibrary = await searchBookOpenLibrary(searchQuery);

    const OpenLibraryCandidates: BookCandidate[] = []; // à supprimer
    for (const doc of resultOpenLibrary.docs) {
      const arrayISBN = doc.editions.docs[0].isbn; // tableau des ISBN
      let isbn_10 = undefined;
      let isbn_13 = undefined;
      const numEditions = doc.editions.numFound;

      if (!arrayISBN && numEditions < 2) continue; // livre sans ISBN et sans autres éditions
      // Parfois, un ancien livre peut avoir une première édition sans ISBN qui ressort, mais des rééditions avec ISBN (exemple : L'Étranger d'Albert Camus)

      if (arrayISBN != undefined) {
        for (const isbn of arrayISBN) {
          let currentISBN = isbn.replace(/-/g, "");

          if (currentISBN.length == 10) {
            if (currentISBN.startsWith("2")) {
              isbn_10 = currentISBN;
            }
          } else if (currentISBN.length == 13) {
            if (
              currentISBN.startsWith("978") ||
              currentISBN.startsWith("979")
            ) {
              isbn_13 = currentISBN;
            }
          }
        }

        if (!isbn_10 && !isbn_13) continue; // ISBN invalide
      }

      const candidate: BookCandidate = {
        isbn_10,
        isbn_13,
        title: doc.editions.docs[0].title,
        subtitle: doc.editions.docs[0].subtitle,
        authors: doc.author_name,
        series_name: doc.series_name ? doc.series_name[0] : null,
        series_position: doc.series_position ? doc.series_position[0] : null,
        cover_id: doc.editions.docs[0].cover_i,
        source: "openlibrary",
      };

      OpenLibraryCandidates.push(candidate); // à supprimer

      insertBook(newCatalog, candidate); // ajouter le livre au catalogue
    }
    setOpenLibraryBooks(OpenLibraryCandidates); // à supprimer

    // BNF
    const resultBNF = await searchBookBNF(searchQuery);
    const rawRecords =
      resultBNF["srw:searchRetrieveResponse"]?.["srw:records"]?.["srw:record"];
    const records = Array.isArray(rawRecords)
      ? rawRecords
      : rawRecords
        ? [rawRecords]
        : [];

    const BNFCandidates: BookCandidate[] = []; // à supprimer
    for (const record of records) {
      let isbn: string = String(getSubfield(getField(record, "010"), "a"));
      let isbn_10 = undefined;
      let isbn_13 = undefined;

      if (!isbn) continue; // livre sans ISBN

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

      const title = getSubfield(getField(record, "200"), "a");
      const subtitle = getSubfield(getField(record, "200"), "e");

      const authors = [];

      for (const tag of ["700", "701", "703"]) {
        for (const field of getFields(record, tag)) {
          const role = getSubfield(field, "4");

          // 070 = auteur -- 071 = co-auteur
          if (role == 70 || role == 71 || !role) {
            const lastName = getSubfield(field, "a") || "";
            const firstName = getSubfield(field, "b") || "";
            const author = `${firstName} ${lastName}`.trim();

            if (author) {
              authors.push(author);
            }
          }
        }
      }

      const series_name = getSubfield(getField(record, "461"), "t");
      const series_position = getSubfield(getField(record, "461"), "v");

      const candidate: BookCandidate = {
        isbn_10,
        isbn_13,
        title,
        subtitle,
        authors,
        series_name,
        series_position,
        source: "bnf",
      };
      BNFCandidates.push(candidate); // à supprimer

      insertBook(newCatalog, candidate);
    }
    setBNFBooks(BNFCandidates); // à supprimer

    setCatalog(newCatalog);
  }

  return (
    <ScrollView
      style={{ backgroundColor: Colors.surface.default }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top }]}
    >
      <Searchbar
        value={searchQuery}
        onType={setSearchQuery}
        onSearch={fetchResult}
      />

      <View style={styles.resultContainer}>
        {catalog.length !== 0 ? (
          catalog.map((book, i) => <Book key={`book-${i}`} book={book} />)
        ) : (
          <TextComponent>Aucun résultat</TextComponent>
        )}
      </View>

      {/* <TextComponent variant="large">API OpenLibrary</TextComponent>
      <View style={styles.resultContainer}>
        {openLibraryBooks.map((book, i) => (
          <View key={i + "-openLibrary"} style={styles.booksResult}>
            {book.series_name && (
              <TextComponent variant="small">
                #{book.series_position ?? "?"} {book.series_name}
              </TextComponent>
            )}
            {book.subtitle ? (
              <TextComponent>
                {book.title} : {book.subtitle}
              </TextComponent>
            ) : (
              <TextComponent>{book.title}</TextComponent>
            )}
            <View style={styles.subInfo}>
              {book.authors?.map((author, i) => (
                <TextComponent key={`${author}-${i}`}>
                  {author}
                  {i < book.authors!.length - 1 ? ", " : ""}
                </TextComponent>
              ))}
            </View>
            <TextComponent variant="small">
              ISBN 10 : {book.isbn_10}
            </TextComponent>
            <TextComponent variant="small">
              ISBN 13 : {book.isbn_13}
            </TextComponent>
          </View>
        ))}
      </View>

      <Text>API BNF</Text>
      <View style={styles.resultContainer}>
        {BNFBooks.map((book, i) => (
          <View key={i + "-BNF"} style={styles.booksResult}>
            {book.series_name &&
              (book.series_position ? (
                <Text>
                  #{book.series_position} {book.series_name}
                </Text>
              ) : (
                <Text>{book.series_name}</Text>
              ))}
            {book.subtitle ? (
              <Text>
                {book.title} : {book.subtitle}
              </Text>
            ) : (
              <Text>{book.title}</Text>
            )}
            <View style={styles.subInfo}>
              {book.authors?.map((author, i) => (
                <Text key={`${author}-${i}`}>
                  {author}
                  {i < book.authors!.length - 1 ? ", " : ""}
                </Text>
              ))}
            </View>
            <Text>ISBN 10 : {book.isbn_10}</Text>
            <Text>ISBN 13 : {book.isbn_13}</Text>
          </View>
        ))}
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    gap: 12,
  },
  resultContainer: {
    display: "flex",
    gap: 8,
    flexDirection: "column",
  },
  booksResult: {
    backgroundColor: "#FEFEFE",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginInline: 12,
  },
  subInfo: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
});
