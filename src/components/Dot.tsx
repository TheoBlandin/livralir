import { Colors } from "@/constants/Colors";
import { View, StyleSheet } from "react-native";

export default function Dot({ status } : { status: 'current' | 'default' | 'mini'}) {
    return (
        <View style={styles[status]}>

        </View>
    )
}

const styles = StyleSheet.create({
    current: {
        backgroundColor: Colors.text.inverse.default,
        width: 20,
        height: 8,
        borderRadius: 8
    },
    default: {
        backgroundColor: Colors.text.inverse.quiet,
        width: 8,
        height: 8,
        borderRadius: 8
    },
    mini: {
        backgroundColor: Colors.text.inverse.quiet,
        width: 4,
        height: 4,
        borderRadius: 8
    }
})