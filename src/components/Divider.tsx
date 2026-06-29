import { Colors } from "@/constants/Colors";
import { View, StyleSheet } from "react-native";

export default function Divider({ margin }: { margin: number }) {
  return <View style={[styles.divider, { marginVertical: margin }]}></View>;
}

const styles = StyleSheet.create({
  divider: {
    backgroundColor: Colors.stroke.quiet,
    height: 1,
    width: "100%",
  },
});
