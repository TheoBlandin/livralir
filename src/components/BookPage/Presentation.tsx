import { Colors } from "@/constants/Colors";
import { BookOverview } from "@/types/Work";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Button from "../Button";
import Text from "../Text";
import Dot from "../Dot";

/**
 * Entête de la page d'un livre, présentant l'édition actuelle et un carousel pour faire défiler les éditions
 * @param {BookOverview} book - Livre
 * @param {number} nbEditions - Nombre d'édition du livre
 * @param {number} indexCurrentEdition - Index de l'édition actuelle dans le tableau d'objet Edition dans le livre
 * @param {(i: number) => void} setIndexCurrentEdition - Setter de l'index de l'édition actuelle, manipulé via le carousel
 * @returns 
 */
export default function Presentation({
  book,
  nbEditions,
  indexCurrentEdition,
  setIndexCurrentEdition,
}: {
  book: BookOverview;
  nbEditions: number;
  indexCurrentEdition: number;
  setIndexCurrentEdition: (i: number) => void;
}) {
  const [coverUri, setCoverUri] = useState(
    book.editions[indexCurrentEdition].cover ? book.editions[indexCurrentEdition].cover!.large : undefined,
  );
  const [hasCover, setHasCover] = useState(coverUri ? true : false);

  const [metadata, setMetadata] = useState(
    [
      book.editions[indexCurrentEdition].pages
        ? `${book.current_edition.pages} pages`
        : null,
      book.editions[indexCurrentEdition].publisher,
      book.editions[indexCurrentEdition].date,
    ]
      .filter(Boolean)
      .join(" · "),
  );

  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    // Nouvelle couverture
    const newCover = book.editions[indexCurrentEdition].cover ? book.editions[indexCurrentEdition].cover!.large : undefined;

    setCoverUri(newCover);
    setHasCover(newCover ? true : false);

    // Calculer le ratio de l'image
    if (newCover) {
      Image.getSize(newCover, (width, height) => {
        setRatio(width / height);
      });
    }

    // Données relatives à l'édition
    setMetadata(
      [
        book.editions[indexCurrentEdition].pages
          ? `${book.editions[indexCurrentEdition].pages} pages`
          : null,
        book.editions[indexCurrentEdition].publisher,
        book.editions[indexCurrentEdition].date,
      ]
        .filter(Boolean)
        .join(" · "),
    );
  }, [indexCurrentEdition])

  function previousEdition() {
    setIndexCurrentEdition(
      indexCurrentEdition === 0 ? nbEditions - 1 : indexCurrentEdition - 1,
    );
  }

  function nextEdition() {
    setIndexCurrentEdition(
      indexCurrentEdition === nbEditions - 1 ? 0 : indexCurrentEdition + 1,
    );
  }

  const visibleCount = 5;

  const start = Math.max(
    0,
    Math.min(indexCurrentEdition - 2, nbEditions - visibleCount),
  );

  const end = Math.min(start + visibleCount, nbEditions);

  const showStartMini = start > 0;
  const showEndMini = end < nbEditions;

  return (
    <View style={styles.container.container}>
      <View style={styles.book.book}>
        <Image
          source={
            hasCover
              ? { uri: coverUri }
              : require("../../../assets/cover-placeholder.png")
          }
          onError={() => setHasCover(false)}
          style={[styles.book.cover, !hasCover ? styles.book.placeholderCover : null, { aspectRatio: ratio }]}
        />

        <View style={styles.book.infos}>
          <View>
            {book.series_name &&
              (book.series_position ? (
                <Text color="inverse" variant="small">
                  #{book.series_position} {book.series_name}
                </Text>
              ) : (
                <Text color="inverse" variant="small">
                  {book.series_name}
                </Text>
              ))}
            {book.subtitle ? (
              <Text variant="large" color="inverse" weight="bold">
                {book.title} : {book.subtitle}
              </Text>
            ) : (
              <Text variant="large" color="inverse" weight="bold">
                {book.title}
              </Text>
            )}
            {book.authors?.map((author, i) => (
              <Text color="inverse" variant="body" key={`${author}-${i}`}>
                {author}
                {i < book.authors!.length - 1 ? ", " : ""}
              </Text>
            ))}
          </View>
          <Text color="inverse" variant="small">
            {metadata}
          </Text>
        </View>
      </View>
      {nbEditions != 0 && (
        <View style={styles.editions.container}>
          <View style={styles.editions.tag}>
            <Text variant="small" numLines="single">
              {nbEditions} édition{nbEditions > 1 ? "s" : ""}
            </Text>
          </View>
          <View style={styles.editions.carousel}>
            <Button
              type="icon"
              hierarchy="tertiary"
              on="dark"
              icon="chevronLeft"
              onPress={previousEdition}
            ></Button>
            <View style={styles.editions.indicator}>
              {showStartMini && <Dot status="mini" />}

              {Array.from({ length: end - start }).map((_, offset) => {
                const index = start + offset;

                return (
                  <Dot
                    key={index}
                    status={
                      index === indexCurrentEdition ? "current" : "default"
                    }
                  />
                );
              })}

              {showEndMini && <Dot status="mini" />}
            </View>
            <Button
              type="icon"
              hierarchy="tertiary"
              on="dark"
              icon="chevronRight"
              onPress={nextEdition}
            ></Button>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = {
  container: StyleSheet.create({
    container: {
      flexDirection: "column",
      gap: 4,
    },
  }),
  book: StyleSheet.create({
    book: {
      flexDirection: "row",
      gap: 16,
    },
    cover: {
      width: 113,
      borderRadius: 4,
    },
    placeholderCover: {
      height: 179
    },
    infos: {
      flexDirection: "column",
      gap: 8,
      flex: 1,
    },
  }),
  editions: StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: 16,
      alignItems: "center",
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.surface.default,
    },
    carousel: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flex: 1,
    },
    indicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
  }),
};
