import {
  TextInput,
  StyleSheet,
  Pressable,
  View,
} from "react-native";

import { Search, X } from "lucide-react-native";
import { useRef, useState } from "react";
import { Colors } from "@/constants/Colors";
import { SIZES, WEIGHT } from "@/constants/Typography";

export default function Searchbar({
  value,
  onType,
  onSearch,
}: {
  value: string;
  onType: (val: string) => void;
  onSearch: () => void;
}) {
  const inputRef = useRef<TextInput>(null);

  const [isFocused, setIsFocused] = useState(false);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View
      style={[styles.searchbar, isFocused && styles.searchbarFocused]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={focusInput}
    >
      <Search size={20} color={Colors.text.default.default} />
      <TextInput
        ref={inputRef}
        value={value}
        style={styles.textInput}
        placeholder="Chercher par titre, auteur ou ISBN"
        placeholderTextColor={Colors.text.default.quiet}
        cursorColor={Colors.text.default.default}
        onChangeText={onType}
        onSubmitEditing={onSearch}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
      />
      {value != "" && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onType("");
          }}
          accessibilityLabel="Effacer la saisie"
          hitSlop={8}
        >
          <X size={20} color={Colors.text.default.default} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface.default,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.stroke.strong,
  },
  searchbarFocused: {
    borderColor: Colors.stroke.primary,
  },
  textInput: {
    fontFamily: WEIGHT["regular"],
    fontSize: SIZES["body"],
    lineHeight: SIZES["body"] * 1.3,
    color: Colors.text.default.default,
    flex: 1,
    width: "100%",
    padding: 0,
  },
});
