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
        color ? styles.color[color] : styles.color.default,
        variant ? styles.variant[variant] : styles.variant.body,
        weight ? styles.weight[weight] : styles.weight.regular,
        { lineHeight: lineHeight },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = {
  color: StyleSheet.create({
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
  }),

  variant: StyleSheet.create({
    large: {
      fontSize: SIZES["large"],
    },
    body: {
      fontSize: SIZES["body"],
    },
    small: {
      fontSize: SIZES["small"],
    },
  }),

  weight: StyleSheet.create({
    regular: {
      fontFamily: WEIGHT["regular"],
    },
    bold: {
      fontFamily: WEIGHT["bold"],
    },
  }),
};
