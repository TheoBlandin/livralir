import Presentation from "@/components/BookPage/Presentation";
import Summary from "@/components/BookPage/Summary";
import { Colors } from "@/constants/Colors";
import { useStore } from "@/store/useStore";
import { BookOverview, Edition } from "@/types/Work";
import { fetchEditions } from "@/utils/getBookEditions";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookPage() {
  const insets = useSafeAreaInsets();

  const book: BookOverview = useStore((state) => state.selectedItem)!;
  const updateSelectedItem = useStore((state) => state.updateSelectedItem);

  const [nbEditions, setNbEditions] = useState<number>(0);
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);
  const [hasCover, setHasCover] = useState(coverUri ? true : false);
  const [indexCurrentEdition, setIndexCurrentEdition] = useState<number>(0);

  useEffect(() => {
    // Récupérer les différentes éditions via la BNF
    async function fetch() {
      const data = await fetchEditions(book);

      // Retrouver l'édition qui est apparût dans la recherche pour la mettre en édition par défaut
      const newIndex = data.editions.findIndex(
        (edition: Edition) =>
          edition.isbn.isbn_10 == book.current_edition.isbn.isbn_10 ||
          edition.isbn.isbn_13 == book.current_edition.isbn.isbn_13,
      );
      setIndexCurrentEdition(newIndex == -1 ? 0 : newIndex);

      setNbEditions(data.countEditions);

      // Couverture de l'édition à afficher en premier
      const newCover = book.editions[indexCurrentEdition].cover ? book.editions[indexCurrentEdition].cover!.large : undefined;
      setCoverUri(newCover);
      setHasCover(newCover ? true : false);

      // Édition sélectionnée
      updateSelectedItem({
        editions: data.editions,
      });
    }

    fetch();
  }, []);

  useEffect(() => {
    const newCover = book.editions[indexCurrentEdition].cover ? book.editions[indexCurrentEdition].cover!.large : undefined;
    setCoverUri(newCover);

    setHasCover(newCover ? true : false);
  }, [indexCurrentEdition]);

  return (
    book && (
      <View style={styles.page}>
        <ImageBackground
          source={
            hasCover
              ? { uri: coverUri }
              : require("../../assets/cover-placeholder.png")
          }
          onError={() => setHasCover(false)}
          resizeMode="cover"
        >
          <View style={[styles.overlay, { paddingTop: insets.top }]}>
            <Presentation
              book={book}
              nbEditions={nbEditions}
              indexCurrentEdition={indexCurrentEdition}
              setIndexCurrentEdition={setIndexCurrentEdition}
            />
          </View>
        </ImageBackground>
        <View style={styles.info_container}>
          <Summary book={book} indexCurrentEdition={indexCurrentEdition} />
        </View>
      </View>
    )
  );
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    flex: 1
  },
  overlay: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  info_container: {
    marginTop: -16,
    gap: 16,
    padding: 16,
    backgroundColor: Colors.surface.default,
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
