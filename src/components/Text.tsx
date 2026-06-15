import { Colors } from "@/constants/Colors";
import {
  TextVariant,
  TextWeight,
  TextLines,
  SIZES,
  WEIGHT,
  TextColor,
} from "@/constants/Typography";
import { StyleSheet, Text } from "react-native";

export default function TextComponent({
  variant,
  weight,
  numLines,
  color,
  children,
}: {
  variant?: TextVariant;
  weight?: TextWeight;
  numLines?: TextLines;
  color?: TextColor;
  children: React.ReactNode;
}) {
  const lineHeight =
    numLines === "single"
      ? SIZES[variant ?? "body"]
      : SIZES[variant ?? "body"] * 1.4;

  return (
    <Text
      style={[
        color == "quiet"
          ? styles.quiet
          : color == "inverse"
            ? styles.inverse
            : color == "inverseQuiet"
              ? styles.inverseQuiet
              : color == "alert"
                ? styles.alert
                : color == "primary"
                  ? styles.primary
                  : styles.default, // valeur par défaut
        variant == "large"
          ? styles.large
          : variant == "small"
            ? styles.small
            : styles.body, // valeur par défaut
        weight == "bold" ? styles.bold : styles.regular,
        { lineHeight: lineHeight },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  // color
  default: {
    color: Colors.text.default.default,
  },
  quiet: {
    color: Colors.text.default.quiet,
  },
  inverse: {
    color: Colors.text.inverse.default,
  },
  inverseQuiet: {
    color: Colors.text.inverse.quiet,
  },
  primary: {
    color: Colors.text.default.primary,
  },
  alert: {
    color: Colors.text.default.alert,
  },

  // variant
  large: {
    fontSize: SIZES["large"],
  },
  body: {
    fontSize: SIZES["body"],
  },
  small: {
    fontSize: SIZES["small"],
  },

  // weight
  regular: {
    fontFamily: WEIGHT["regular"],
  },
  bold: {
    fontFamily: WEIGHT["bold"],
  },
});
