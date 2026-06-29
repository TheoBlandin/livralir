import { Colors } from "@/constants/Colors";
import { Pressable, StyleSheet } from "react-native";

import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";

const icons = {
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
} as const;

type IconName = keyof typeof icons;

export default function Button({
  type,
  hierarchy,
  on,
  icon,
  iconPosition,
  onPress,
}: {
  type: "text" | "icon";
  hierarchy: "primary" | "secondary" | "tertiary";
  on?: "light" | "dark";
  icon?: IconName;
  iconPosition?: "left" | "right";
  onPress: () => void;
}) {
  function getBackgroundStyle() {
    if (hierarchy !== "tertiary") return press ? styles.hierarchy[hierarchy].pressed : styles.hierarchy[hierarchy].default;

    return on === "dark"
      ? press ? styles.hierarchy.tertiaryOnDark.pressed : styles.hierarchy.tertiaryOnDark.default
      : press ? styles.hierarchy.tertiaryOnLight.pressed : styles.hierarchy.tertiaryOnLight.default;
  }

  function getContentColor() {
    if (hierarchy === "primary") return Colors.text.inverse.default;
    if (hierarchy === "secondary") return Colors.text.default.default;

    // tertiary
    return on === "dark"
      ? Colors.text.inverse.default
      : Colors.text.default.default;
  }

  const Icon = icon ? icons[icon] : null;
  const contentColor = getContentColor();

  const [press, setPress] = useState<boolean>(false);

  return (
    <Pressable
      style={[styles.type[type], getBackgroundStyle()]}
      onPress={onPress}
      onPressIn={() => setPress(true)}
      onPressOut={() => setPress(false)}
    >
      {Icon && type == "icon" && <Icon size={20} color={contentColor} />}
    </Pressable>
  );
}

const styles = {
  type: StyleSheet.create({
    text: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      flexDirection: "row",
      gap: 8,
    },
    icon: {
      padding: 12,
      borderRadius: 8,
    },
  }),

  hierarchy: {
    primary: StyleSheet.create({
      default: {
        backgroundColor: Colors.interactibles.primary.default,
      },
      pressed: {
        backgroundColor: Colors.interactibles.primary.pressed
      }
    }),
    secondary: StyleSheet.create({
      default: {
        backgroundColor: Colors.interactibles.secondary.default,
      },
      pressed: {
        backgroundColor: Colors.interactibles.secondary.pressed
      }
    }),
    tertiaryOnLight: StyleSheet.create({
      default: {
        backgroundColor: Colors.interactibles.tertiary.onLight.default,
      },
      pressed: {
        backgroundColor: Colors.interactibles.tertiary.onLight.pressed
      }
    }),
    tertiaryOnDark: StyleSheet.create({
      default: {
        backgroundColor: Colors.interactibles.tertiary.onDark.default,
      },
      pressed: {
        backgroundColor: Colors.interactibles.tertiary.onDark.pressed
      }
    }),
  },
};
