import { BookOverview, Edition } from "@/types/Work";
import { View, StyleSheet } from "react-native";
import Text from "../Text";
import { useEffect, useState } from "react";

export default function Informations({ book, indexCurrentEdition }: {
    book: BookOverview;
    indexCurrentEdition: number;
}) {
    const [currentEdition, setCurrentEdition] = useState<Edition>(book.editions[indexCurrentEdition])

    useEffect(() => {
        setCurrentEdition(book.editions[indexCurrentEdition])
    }, [indexCurrentEdition])

    return (
        <View style={styles.container}>
            <Text variant="large" weight="bold" numLines="single">Informations</Text>
            <View style={styles.flex_info}>
                <View style={styles.info}>
                    <Text variant="small" color="quiet" numLines="single">ISBN</Text>
                    <Text>{currentEdition.isbn.isbn_10 ?? currentEdition.isbn.isbn_13}</Text>
                </View>
                {currentEdition.infos.publication && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Publication</Text>
                        <Text>{currentEdition.infos.publication}</Text>
                    </View>
                )}
                {currentEdition.infos.publisher && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Éditeur</Text>
                        <Text>{currentEdition.infos.publisher}</Text>
                    </View>
                )}
                {currentEdition.infos.collection && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Collection</Text>
                        <Text>{currentEdition.infos.collection}</Text>
                    </View>
                )}
                {currentEdition.infos.pages && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Pages</Text>
                        <Text>{currentEdition.infos.pages}</Text>
                    </View>
                )}
                {currentEdition.infos.format && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Format</Text>
                        <Text>{currentEdition.infos.format}</Text>
                    </View>
                )}
                {currentEdition.infos.illustrators && currentEdition.infos.illustrators?.length != 0 && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Illustration</Text>
                        {currentEdition.infos.illustrators!.map((illustrator, i) => (
                            <Text key={`${illustrator}-${i}`}>
                                {illustrator}
                                {i < currentEdition.infos.illustrators!.length - 1 ? ", " : ""}
                            </Text>
                        ))}
                    </View>
                )}
                {currentEdition.infos.translators && currentEdition.infos.translators?.length != 0 && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Traduction</Text>
                        {currentEdition.infos.translators!.map((translator, i) => (
                            <Text key={`${translator}-${i}`}>
                                {translator}
                                {i < currentEdition.infos.translators!.length - 1 ? ", " : ""}
                            </Text>
                        ))}
                    </View>
                )}
                {currentEdition.infos.vo_title && (
                    <View style={styles.info}>
                        <Text variant="small" color="quiet" numLines="single">Traduction de</Text>
                        <Text>{currentEdition.infos.vo_title}</Text>
                    </View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 8,
    },
    flex_info: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8
    },
    info: {
        flexDirection: "column",
        width: "48%"
    }
});