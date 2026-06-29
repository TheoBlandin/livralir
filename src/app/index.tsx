import { useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  getField,
  getFields,
  getSubfield,
  searchBookBNF,
} from "@/services/apiBNF";

import BookPressable from "@/components/Book/BookPressable";
import Divider from "@/components/Divider";
import Searchbar from "@/components/Searchbar";
import Text from "@/components/Text";
import { Colors } from "@/constants/Colors";
import { searchBookOpenLibrary } from "@/services/apiOpenLibrary";
import { BookCandidate, BookOverview } from "@/types/Work";
import { insertBook } from "@/utils/mergeBooksResults";

export default function Index() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [BNFBooks, setBNFBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [openLibraryBooks, setOpenLibraryBooks] = useState<BookCandidate[]>([]); // à supprimer
  const [catalog, setCatalog] = useState<BookOverview[]>([]);

  async function fetchResult() {
    const newCatalog: BookOverview[] = [];

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
        title: String(doc.editions.docs[0].title),
        subtitle: doc.editions.docs[0].subtitle
          ? String(doc.editions.docs[0].subtitle)
          : undefined,
        authors: doc.author_name,
        series_name: doc.series_name ? String(doc.series_name[0]) : undefined,
        series_position: doc.series_position
          ? doc.series_position[0]
          : undefined,
        source: "openlibrary",
        id: doc.key,
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
      let isbn = getSubfield(getField(record, "010"), "a");
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

      for (const tag of ["700", "701", "702", "703"]) {
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
        title: title ? String(title) : undefined,
        subtitle: subtitle ? String(subtitle) : undefined,
        authors,
        series_name: series_name ? String(series_name) : undefined,
        series_position: series_position ? String(series_position) : undefined,
        source: "bnf",
        id: record["srw:recordData"]["mxc:record"]["@_id"],
      };
      BNFCandidates.push(candidate); // à supprimer

      insertBook(newCatalog, candidate);
    }
    setBNFBooks(BNFCandidates); // à supprimer

    const filteredCatalog: BookOverview[] = newCatalog.filter(
      (work) => work.source != "bnf",
    );
    setCatalog(filteredCatalog);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        value={searchQuery}
        onType={setSearchQuery}
        onSearch={fetchResult}
      />

      <FlatList
        data={catalog}
        renderItem={({ item }) => <BookPressable book={item} variant="list" />}
        keyExtractor={(item, index) => `book-${index}`}
        ItemSeparatorComponent={<Divider margin={16} />}
        ListEmptyComponent={<Text>Aucun résultat</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: Colors.surface.default,
    flex: 1,
    paddingHorizontal: 16,
  },
});
