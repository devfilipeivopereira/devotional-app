import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Pressable,
    ActivityIndicator,
    TextInput,
    FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/lib/useTheme";
import Colors from "@/constants/colors";
import { Typography } from "@/constants/design";
import {
    getChapter,
    getRandomVerse,
    getBooks,
    BIBLE_VERSIONS,
    type BibleVersionId,
    type BibleVerse,
    type BibleBook,
    type BibleRandomVerseResponse,
} from "@/lib/bible-service";

type ViewMode = "books" | "chapters" | "reading";

export default function BibleScreen() {
    const { theme } = useTheme();
    const [viewMode, setViewMode] = useState<ViewMode>("books");
    const [testament, setTestament] = useState<"VT" | "NT">("VT");
    const [search, setSearch] = useState("");
    const [books, setBooks] = useState<BibleBook[]>([]);
    const [loadingBooks, setLoadingBooks] = useState(true);
    const [version, setVersion] = useState<BibleVersionId>("nvi");

    // Selected state
    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<number>(1);
    const [verses, setVerses] = useState<BibleVerse[]>([]);
    const [loadingVerses, setLoadingVerses] = useState(false);

    // Verse of the day
    const [verseOfDay, setVerseOfDay] = useState<BibleRandomVerseResponse | null>(null);

    useEffect(() => {
        loadBooks();
        loadVerseOfDay();
    }, []);

    const loadBooks = async () => {
        setLoadingBooks(true);
        try {
            const data = await getBooks();
            setBooks(data);
        } catch (err) {
            console.error("Error loading books:", err);
            // Fallback: use static list
            setBooks([]);
        } finally {
            setLoadingBooks(false);
        }
    };

    const loadVerseOfDay = async () => {
        try {
            const verse = await getRandomVerse(version);
            setVerseOfDay(verse);
        } catch (err) {
            console.error("Error loading verse of day:", err);
        }
    };

    const loadChapter = useCallback(
        async (book: BibleBook, chapter: number) => {
            setLoadingVerses(true);
            try {
                const data = await getChapter(book.abbrev.pt, chapter, version);
                setVerses(data.verses);
            } catch (err) {
                console.error("Error loading chapter:", err);
                setVerses([]);
            } finally {
                setLoadingVerses(false);
            }
        },
        [version]
    );

    const handleBookSelect = (book: BibleBook) => {
        setSelectedBook(book);
        setViewMode("chapters");
    };

    const handleChapterSelect = (chapter: number) => {
        if (!selectedBook) return;
        setSelectedChapter(chapter);
        setViewMode("reading");
        loadChapter(selectedBook, chapter);
    };

    const handleBack = () => {
        if (viewMode === "reading") {
            setViewMode("chapters");
            setVerses([]);
        } else if (viewMode === "chapters") {
            setViewMode("books");
            setSelectedBook(null);
        }
    };

    // Filter books
    const filteredBooks = books.filter((b) => {
        const matchesTestament = b.testament === testament;
        const matchesSearch =
            !search || b.name.toLowerCase().includes(search.toLowerCase());
        return matchesTestament && matchesSearch;
    });

    // ─── Reading View ────────────────────────────────────────
    if (viewMode === "reading" && selectedBook) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.readingHeader, { borderBottomColor: theme.border }]}>
                    <Pressable onPress={handleBack} hitSlop={12}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </Pressable>
                    <Text style={[styles.readingTitle, { color: theme.text }]}>
                        {selectedBook.name} {selectedChapter}
                    </Text>
                    <Pressable onPress={() => {
                        const currentIdx = BIBLE_VERSIONS.findIndex(v => v.id === version);
                        const nextIdx = (currentIdx + 1) % BIBLE_VERSIONS.length;
                        const newVersion = BIBLE_VERSIONS[nextIdx].id;
                        setVersion(newVersion);
                        if (selectedBook) loadChapter(selectedBook, selectedChapter);
                    }} hitSlop={8}>
                        <Text style={[styles.versionBadge, { color: Colors.palette.coral }]}>
                            {BIBLE_VERSIONS.find(v => v.id === version)?.label ?? "NVI"}
                        </Text>
                    </Pressable>
                </View>

                {loadingVerses ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.palette.coral} />
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.readingContent}>
                        {verses.map((verse) => (
                            <Text key={verse.number} style={[styles.verseText, { color: theme.text }]}>
                                <Text style={[styles.verseNumber, { color: Colors.palette.coral }]}>
                                    {verse.number}{" "}
                                </Text>
                                {verse.text}
                            </Text>
                        ))}

                        {/* Chapter navigation */}
                        <View style={styles.chapterNav}>
                            {selectedChapter > 1 && (
                                <Pressable
                                    onPress={() => handleChapterSelect(selectedChapter - 1)}
                                    style={[styles.chapterNavBtn, { backgroundColor: theme.card }]}
                                >
                                    <Ionicons name="chevron-back" size={18} color={theme.text} />
                                    <Text style={[styles.chapterNavText, { color: theme.text }]}>
                                        Capítulo {selectedChapter - 1}
                                    </Text>
                                </Pressable>
                            )}
                            {selectedChapter < selectedBook.chapters && (
                                <Pressable
                                    onPress={() => handleChapterSelect(selectedChapter + 1)}
                                    style={[styles.chapterNavBtn, { backgroundColor: theme.card, marginLeft: "auto" }]}
                                >
                                    <Text style={[styles.chapterNavText, { color: theme.text }]}>
                                        Capítulo {selectedChapter + 1}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={18} color={theme.text} />
                                </Pressable>
                            )}
                        </View>
                    </ScrollView>
                )}
            </SafeAreaView>
        );
    }

    // ─── Chapter Selector ────────────────────────────────────
    if (viewMode === "chapters" && selectedBook) {
        const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.readingHeader, { borderBottomColor: theme.border }]}>
                    <Pressable onPress={handleBack} hitSlop={12}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </Pressable>
                    <Text style={[styles.readingTitle, { color: theme.text }]}>
                        {selectedBook.name}
                    </Text>
                    <View style={{ width: 24 }} />
                </View>

                <Text style={[styles.sectionLabel, { color: theme.textSecondary, padding: 20 }]}>
                    SELECIONE O CAPÍTULO
                </Text>

                <FlatList
                    data={chapters}
                    numColumns={5}
                    keyExtractor={(item) => String(item)}
                    contentContainerStyle={styles.chapterGrid}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => handleChapterSelect(item)}
                            style={[styles.chapterCell, { backgroundColor: theme.card }]}
                        >
                            <Text style={[styles.chapterCellText, { color: theme.text }]}>
                                {item}
                            </Text>
                        </Pressable>
                    )}
                />
            </SafeAreaView>
        );
    }

    // ─── Books List ──────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Title + Version selector */}
                <View style={styles.titleRow}>
                    <Text style={[styles.title, { color: theme.text }]}>Bíblia</Text>
                </View>

                {/* Version Selector */}
                <View style={[styles.versionRow, { backgroundColor: theme.card }]}>
                    {BIBLE_VERSIONS.map((v) => (
                        <Pressable
                            key={v.id}
                            onPress={() => {
                                setVersion(v.id);
                                // Reload verse of day with new version
                                getRandomVerse(v.id).then(setVerseOfDay).catch(() => { });
                            }}
                            style={[
                                styles.versionBtn,
                                version === v.id && { backgroundColor: Colors.palette.coral },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.versionBtnText,
                                    { color: version === v.id ? "#fff" : theme.textSecondary },
                                ]}
                            >
                                {v.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Verse of the Day */}
                {verseOfDay && (
                    <View style={[styles.verseOfDayCard, { backgroundColor: Colors.palette.coral + "15" }]}>
                        <Text style={[styles.verseOfDayLabel, { color: Colors.palette.coral }]}>
                            VERSÍCULO DO DIA
                        </Text>
                        <Text style={[styles.verseOfDayText, { color: theme.text }]}>
                            "{verseOfDay.text}"
                        </Text>
                        <Text style={[styles.verseOfDayRef, { color: theme.textSecondary }]}>
                            — {verseOfDay.book.name} {verseOfDay.chapter}:{verseOfDay.number}
                        </Text>
                    </View>
                )}

                {/* Search */}
                <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
                    <Ionicons name="search" size={18} color={theme.textSecondary} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Buscar livro..."
                        placeholderTextColor={theme.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search ? (
                        <Pressable onPress={() => setSearch("")} hitSlop={8}>
                            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </Pressable>
                    ) : null}
                </View>

                {/* Testament Toggle */}
                <View style={[styles.toggleRow, { backgroundColor: theme.card }]}>
                    <Pressable
                        onPress={() => setTestament("VT")}
                        style={[
                            styles.toggleBtn,
                            testament === "VT" && { backgroundColor: Colors.palette.coral },
                        ]}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                { color: testament === "VT" ? "#fff" : theme.textSecondary },
                            ]}
                        >
                            Antigo Testamento
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setTestament("NT")}
                        style={[
                            styles.toggleBtn,
                            testament === "NT" && { backgroundColor: Colors.palette.coral },
                        ]}
                    >
                        <Text
                            style={[
                                styles.toggleText,
                                { color: testament === "NT" ? "#fff" : theme.textSecondary },
                            ]}
                        >
                            Novo Testamento
                        </Text>
                    </Pressable>
                </View>

                {/* Books */}
                {loadingBooks ? (
                    <ActivityIndicator
                        size="large"
                        color={Colors.palette.coral}
                        style={{ marginTop: 40 }}
                    />
                ) : (
                    filteredBooks.map((book) => (
                        <Pressable
                            key={book.abbrev.pt}
                            onPress={() => handleBookSelect(book)}
                            style={[styles.bookRow, { borderBottomColor: theme.border }]}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.bookName, { color: theme.text }]}>
                                    {book.name}
                                </Text>
                                <Text style={[styles.bookMeta, { color: theme.textSecondary }]}>
                                    {book.chapters} capítulos • {book.author}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                        </Pressable>
                    ))
                )}

                {!loadingBooks && filteredBooks.length === 0 && (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                        Nenhum livro encontrado
                    </Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    title: {
        ...Typography.headingLarge,
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    // Version Selector
    versionRow: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    versionBtn: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: "center",
    },
    versionBtnText: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 0.5,
    },

    // Verse of Day
    verseOfDayCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    verseOfDayLabel: {
        ...Typography.labelSmall,
        marginBottom: 10,
    },
    verseOfDayText: {
        ...Typography.contentSmall,
        fontStyle: "italic",
        marginBottom: 10,
    },
    verseOfDayRef: {
        ...Typography.caption,
    },

    // Search
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 12,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },

    // Toggle
    toggleRow: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    toggleText: {
        fontSize: 13,
        fontWeight: "700",
    },

    // Book List
    bookRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    bookName: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 2,
    },
    bookMeta: {
        fontSize: 12,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 15,
    },

    // Section
    sectionLabel: {
        ...Typography.label,
    },

    // Chapter Grid
    chapterGrid: {
        paddingHorizontal: 20,
        gap: 8,
    },
    chapterCell: {
        width: 56,
        height: 56,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        margin: 4,
    },
    chapterCellText: {
        fontSize: 18,
        fontWeight: "600",
    },

    // Reading Header
    readingHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    readingTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    versionBadge: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 1,
    },

    // Reading Content
    readingContent: {
        padding: 24,
        paddingBottom: 100,
    },
    verseText: {
        ...Typography.contentSmall,
        marginBottom: 12,
    },
    verseNumber: {
        ...Typography.caption,
        fontWeight: "800",
        fontSize: 11,
    },

    // Chapter Nav
    chapterNav: {
        flexDirection: "row",
        marginTop: 32,
        paddingTop: 20,
    },
    chapterNavBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        gap: 6,
    },
    chapterNavText: {
        fontSize: 14,
        fontWeight: "600",
    },
});
