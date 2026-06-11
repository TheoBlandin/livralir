import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  searchBookBNF,
  getFields,
  getField,
  getSubfield,
} from "@/services/apiBNF";

import { searchBookOpenLibrary } from "@/services/apiOpenLibrary";
import { Book, BookCandidate } from "@/types/books";
import { insertBook } from "@/utils/mergeBooksResults";

export default function Index() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [BNFBooks, setBNFBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [openLibraryBooks, setOpenLibraryBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [catalog, setCatalog] = useState<Book[]>([]);

  async function fetchResult() {
    const newCatalog: Book[] = [];

    // OpenLibrary
    const resultOpenLibrary = await searchBookOpenLibrary(searchInput);

    const OpenLibraryCandidates: BookCandidate[] = []; // à supprimer
    for (const doc of resultOpenLibrary.docs) {
      const isbn = doc.editions.docs[0].isbn;
      const numEditions = doc.editions.numFound;

      if (!isbn && numEditions < 2) continue; // livre sans ISBN

      const candidate: BookCandidate = {
        title: doc.editions.docs[0].title,
        subtitle: doc.editions.docs ? doc.editions.docs[0].subtitle : null,
        authors: doc.author_name,
        series_name: doc.series_name ? doc.series_name[0] : null,
        series_position: doc.series_position ? doc.series_position[0] : null,
        source: "openlibrary",
      };

      OpenLibraryCandidates.push(candidate); // à supprimer

      insertBook(newCatalog, candidate); // ajouter le livre au catalogue
    }
    setOpenLibraryBooks(OpenLibraryCandidates); // à supprimer

    // BNF
    const resultBNF = await searchBookBNF(searchInput);
    const rawRecords =
      resultBNF["srw:searchRetrieveResponse"]?.["srw:records"]?.["srw:record"];
    const records = Array.isArray(rawRecords)
      ? rawRecords
      : rawRecords
        ? [rawRecords]
        : [];

    const BNFCandidates: BookCandidate[] = []; // à supprimer
    for (const record of records) {
      const isbn = getSubfield(getField(record, "010"), "a");

      if (!isbn) continue; // livre sans ISBN

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
    <ScrollView style={styles.container}>
      <Text>Chercher un livre par titre</Text>
      <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
        <TextInput style={styles.searchInput} onChangeText={setSearchInput} />
        <Pressable
          style={styles.button}
          onPress={fetchResult}
        >
          <Text style={styles.buttonLabel}>Rechercher</Text>
        </Pressable>
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
          </View>
        ))}
      </View>

      <Text>API OpenLibrary</Text>
      <View style={styles.resultContainer}>
        {openLibraryBooks.map((book, i) => (
          <View key={i + "-openLibrary"} style={styles.booksResult}>
            {book.series_name && (
              <Text>
                #{book.series_position ?? "?"} {book.series_name}
              </Text>
            )}
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
          </View>
        ))}
      </View>

      <Text>Merge</Text>
      <View style={styles.resultContainer}>
        {catalog.map((book, i) => (
          <View key={i + "-merge"} style={styles.booksResult}>
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
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 12,
  },
  searchInput: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderColor: "black",
    borderWidth: 1,
    width: 250,
  },
  button: {
    backgroundColor: "#414288",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  buttonLabel: {
    color: "white",
  },
  resultContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    flexDirection: "row",
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
