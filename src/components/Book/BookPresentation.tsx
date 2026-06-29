import { Colors } from "@/constants/Colors";
import { BookOverview } from "@/types/Work";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import Button from "../Button";
import Text from "../Text";
import Dot from "../Dot";

export default function BookPresentation({
  book,
  nbEditions,
}: {
  book: BookOverview;
  nbEditions: number;
}) {
  const coverUri = book.cover?.large;

  const [ratio, setRatio] = useState(1);

  const [currentEdition, setCurrentEdition] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (coverUri) {
      Image.getSize(coverUri, (width, height) => {
        if (!cancelled) {
          setRatio(width / height);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [coverUri]);

  function previousEdition() {
    setCurrentEdition(
      currentEdition === 0 ? nbEditions - 1 : currentEdition - 1,
    );
  }

  function nextEdition() {
    setCurrentEdition(
      currentEdition === nbEditions - 1 ? 0 : currentEdition + 1,
    );
  }

  const visibleCount = 5;

  const start = Math.max(
    0,
    Math.min(currentEdition - 2, nbEditions - visibleCount),
  );

  const end = Math.min(start + visibleCount, nbEditions);

  const showStartMini = start > 0;
  const showEndMini = end < nbEditions;

  return (
    <View style={styles.container.container}>
      <View style={styles.book.book}>
        {coverUri && (
          <Image
            source={{ uri: coverUri }}
            style={[styles.book.cover, { aspectRatio: ratio }]}
          />
        )}

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
                    status={index === currentEdition ? "current" : "default"}
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
