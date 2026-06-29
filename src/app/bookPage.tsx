import BookPresentation from "@/components/Book/BookPresentation";
import { Colors } from "@/constants/Colors";
import { getField, getSubfield, searchEditionsBNF } from "@/services/apiBNF";
import { searchEditionsOpenLibrary } from "@/services/apiOpenLibrary";
import { useStore } from "@/store/useStore";
import { BookOverview, Edition } from "@/types/Work";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookPage() {
  const insets = useSafeAreaInsets();

  const book: BookOverview = useStore((state) => state.selectedItem)!;

  const cover = book?.cover ? { uri: book.cover!.large } : undefined;

  const [nbEditions, setNbEditions] = useState<number>(0)

  async function fetchEditions() {
    // OpenLibrary
    // const resultOpenLibrary = await searchEditionsOpenLibrary(searchQuery);

    // BNF
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

    const countEditions = resultBNF["srw:searchRetrieveResponse"]?.["srw:numberOfRecords"];
    setNbEditions(countEditions)
    const BNFEditions: Edition[] = [];
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

      const edition: Edition = {
        id: {
          bnf: record["srw:recordData"]["mxc:record"]["@_id"],
        },
        isbn: {
          isbn_10,
          isbn_13
        }
      };
      BNFEditions.push(edition)
    }

    console.log(
      "Éditions repérées via la BNF (",
      countEditions,
      ") : ",
      JSON.stringify(BNFEditions, null, 2),
    );
  }

  useEffect(() => {
    fetchEditions();
    console.log(
      "Éditions repérées via la recherche (",
      book!.editions.length,
      ") : ",
      JSON.stringify(book!.editions, null, 2),
    );

  }, []);

  return (
    book && (
      <ImageBackground source={cover} resizeMode="cover">
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <BookPresentation book={book} nbEditions={nbEditions} />
        </View>
      </ImageBackground>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    backgroundColor: Colors.surface.default,
    flex: 1,
  },
  overlay: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
