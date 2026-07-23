import { BookOverview } from "@/types/Work";
import Text from "../Text";
import { View, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

export default function Summary({ book, indexCurrentEdition }: {
    book: BookOverview;
    indexCurrentEdition: number;
}) {
    const [summary, setSummary] = useState<string | undefined>(book.editions[indexCurrentEdition].summary)

    useEffect(() => {
        setSummary(book.editions[indexCurrentEdition].summary)
    }, [indexCurrentEdition])

    return (
        <View style={styles.container}>
            <Text variant="large" weight="bold" numLines="single">Résumé</Text>
            <Text>{summary ?? 'Aucun résumé disponible'}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 8,
    }
});