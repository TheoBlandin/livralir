import { Colors } from "@/constants/Colors";
import { Work } from "@/types/Work";
import { Pressable, View, StyleSheet, ImageBackground } from "react-native";
import TextComponent from "./Text";

export default function Book({ book }: { book: Work }) {
  const cover = book.cover ? { uri: book.cover!.medium } : undefined;

  return (
    <Pressable style={styles.card}>
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
          {book.series_name &&
            (book.series_position ? (
              <TextComponent color="quiet" variant="small">
                #{book.series_position} {book.series_name}
              </TextComponent>
            ) : (
              <TextComponent color="quiet" variant="small">
                {book.series_name}
              </TextComponent>
            ))}
          {book.subtitle ? (
            <TextComponent weight="bold">
              {book.title} : {book.subtitle}
            </TextComponent>
          ) : (
            <TextComponent weight="bold">{book.title}</TextComponent>
          )}
          {book.authors?.map((author, i) => (
            <TextComponent color="quiet" variant="small" key={`${author}-${i}`}>
              {author}
              {i < book.authors!.length - 1 ? ", " : ""}
            </TextComponent>
          ))}
        </View>

        {/* à supprimer */}
        <View>
          <TextComponent color="quiet" variant="small">
            Source : {book.source}
          </TextComponent>
          {/* {book.isbn.map((isbn, i) => (
            <View key={`${book.title}-isbn-${i}`}>
              <TextComponent color="quiet" variant="small">
                ---
              </TextComponent>
              <TextComponent color="quiet" variant="small">
                ISBN-10 :{" "}
                {isbn.isbn_10.value &&
                  `${isbn.isbn_10.value} (${isbn.isbn_10.source})`}
              </TextComponent>
              <TextComponent color="quiet" variant="small">
                ISBN-13 :{" "}
                {isbn.isbn_13.value &&
                  `${isbn.isbn_13.value} (${isbn.isbn_13.source})`}
              </TextComponent>
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
