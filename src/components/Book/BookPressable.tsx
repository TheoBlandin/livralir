import { Colors } from "@/constants/Colors";
import { useStore } from "@/store/useStore";
import { BookOverview } from "@/types/Work";
import { router } from "expo-router";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import Text from "../Text";

type BookVariant = "list";

export default function BookPressable({
  book,
  variant,
}: {
  book: BookOverview;
  variant: BookVariant;
}) {
  const cover = book.cover ? { uri: book.cover!.medium } : undefined;

  function handleSelectItem() {
    useStore.getState().setSelectedItem(book);
    router.push("/bookPage");
  }

  return (
    <Pressable onPress={handleSelectItem} style={styles.card}>
      <View style={styles.coverContainer}>
        {cover && (
          <ImageBackground
            source={cover}
            resizeMode="cover"
            style={styles.cover}
          ></ImageBackground>
        )}
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
          {/* {book.isbn.map((isbn, i) => (
            <View key={`${book.title}-isbn-${i}`}>
              <Text color="quiet" variant="small">
                ---
              </Text>
              <Text color="quiet" variant="small">
                ISBN-10 :{" "}
                {isbn.isbn_10.value &&
                  `${isbn.isbn_10.value} (${isbn.isbn_10.source})`}
              </Text>
              <Text color="quiet" variant="small">
                ISBN-13 :{" "}
                {isbn.isbn_13.value &&
                  `${isbn.isbn_13.value} (${isbn.isbn_13.source})`}
              </Text>
            </View>
          ))} */}
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
    backgroundColor: Colors.surface.surface,
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
