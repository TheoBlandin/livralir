import { Colors } from "@/constants/Colors";
import { useStore } from "@/store/useStore";
import { BookOverview } from "@/types/Work";
import { router } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import Text from "../Text";
import { useState } from "react";

type BookVariant = "list";

export default function BookPressable({
  book,
  variant,
}: {
  book: BookOverview;
  variant: BookVariant;
}) {
  function handleSelectItem() {
    useStore.getState().setSelectedItem(book);
    router.push("/bookPage");
  }

  const coverUri = book.current_edition.cover
    ? book.current_edition.cover!.medium
    : undefined;
  const [hasCover, setHasCover] = useState(coverUri ? true : false);

  return (
    <Pressable onPress={handleSelectItem} style={styles.card}>
      <View style={styles.coverContainer}>
        <ImageBackground
          source={
            hasCover
              ? { uri: coverUri }
              : require("../../../assets/cover-placeholder.png")
          }
          onError={() => setHasCover(false)}
          resizeMode="cover"
          style={styles.cover}
        ></ImageBackground>
      </View>
      <View style={styles.info}>
        <View>
          {book.series_name != undefined &&
            (book.series_position ? (
              <Text color="quiet" variant="small">
                #{book.series_position} {book.series_name}
              </Text>
            ) : (
              <Text color="quiet" variant="small">
                {book.series_name}
              </Text>
            ))}
          {book.subtitle ? (
            <Text weight="bold">
              {book.title} : {book.subtitle}
            </Text>
          ) : (
            <Text weight="bold">{book.title}</Text>
          )}
          {book.authors?.map((author, i) => (
            <Text color="quiet" variant="small" key={`${author}-${i}`}>
              {author}
              {i < book.authors!.length - 1 ? ", " : ""}
            </Text>
          ))}
        </View>

        {/* à supprimer */}
        <View>
          <Text color="quiet" variant="small">
            Source : {book.source}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  coverContainer: {
    width: 87,
    height: 139,
    borderRadius: 4,
    overflow: "hidden",
  },
  cover: {
    width: 87,
    height: 139,
    borderRadius: 4,
  },
  info: {
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },
});
