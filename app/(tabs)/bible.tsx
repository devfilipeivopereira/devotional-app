import React, { useState, useEffect, useCallback, useRef } from "react";
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
  const [booksError, setBooksError] = useState<string | null>(null);

  // Sempre iniciar em NVI PT-BR
  const [version, setVersion] = useState<BibleVersionId>("nvi");

  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  const [verseOfDay, setVerseOfDay] = useState<BibleRandomVerseResponse | null>(null);
  const [verseOfDayError, setVerseOfDayError] = useState<string | null>(null);

  const [verseInput, setVerseInput] = useState("");
  const [highlightVerse, setHighlightVerse] = useState<number | null>(null);
  const verseListRef = useRef<FlatList<BibleVerse> | null>(null);

  const loadBooks = useCallback(async () => {
    setLoadingBooks(true);
    setBooksError(null);
    try {
      const data = await getBooks();
      setBooks(data);
    } catch (err) {
      console.error("Error loading books:", err);
      setBooksError("Nao foi possivel carregar os livros da Biblia.");
      setBooks([]);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  const loadVerseOfDay = useCallback(async (forcedVersion?: BibleVersionId) => {
    setVerseOfDayError(null);
    try {
      const verse = await getRandomVerse(forcedVersion ?? version);
      setVerseOfDay(verse);
    } catch (err) {
      console.error("Error loading verse of day:", err);
      setVerseOfDayError("Nao foi possivel carregar o versiculo do dia.");
    }
  }, [version]);

  const loadChapter = useCallback(
    async (book: BibleBook, chapter: number, forcedVersion?: BibleVersionId) => {
      setLoadingVerses(true);
      setChapterError(null);
      try {
        const data = await getChapter(book.abbrev.pt, chapter, forcedVersion ?? version);
        setVerses(data.verses);
      } catch (err) {
        console.error("Error loading chapter:", err);
        setVerses([]);
        setChapterError("Falha ao carregar capitulo. Tente novamente.");
      } finally {
        setLoadingVerses(false);
      }
    },
    [version]
  );

  useEffect(() => {
    loadBooks();
    loadVerseOfDay("nvi");
  }, [loadBooks, loadVerseOfDay]);

  // Se trocar versao durante leitura, recarrega o mesmo capitulo
  useEffect(() => {
    if (viewMode === "reading" && selectedBook) {
      loadChapter(selectedBook, selectedChapter, version);
    }
  }, [version, viewMode, selectedBook, selectedChapter, loadChapter]);

  const handleBookSelect = (book: BibleBook) => {
    setSelectedBook(book);
    setViewMode("chapters");
  };

  const handleChapterSelect = (chapter: number) => {
    if (!selectedBook) return;
    setSelectedChapter(chapter);
    setViewMode("reading");
    setHighlightVerse(null);
    setVerseInput("");
    loadChapter(selectedBook, chapter);
  };

  const handleBack = () => {
    if (viewMode === "reading") {
      setViewMode("chapters");
      setHighlightVerse(null);
    } else if (viewMode === "chapters") {
      setViewMode("books");
      setSelectedBook(null);
    }
  };

  const goToBooks = () => {
    setViewMode("books");
    setHighlightVerse(null);
  };

  const goToChapters = () => {
    if (!selectedBook) return;
    setViewMode("chapters");
    setHighlightVerse(null);
  };

  const goToVerse = () => {
    const target = Number.parseInt(verseInput, 10);
    if (!Number.isFinite(target)) return;
    const index = verses.findIndex((v) => v.number === target);
    if (index < 0) return;
    setHighlightVerse(target);
    verseListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
  };

  const filteredBooks = books.filter((book) => {
    const matchesTestament = book.testament === testament;
    const matchesSearch = !search || book.name.toLowerCase().includes(search.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  if (viewMode === "reading" && selectedBook) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.readingHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.readingTitle, { color: theme.text }]}>
            {selectedBook.name} {selectedChapter}
          </Text>
          <Pressable
            onPress={() => {
              const currentIdx = BIBLE_VERSIONS.findIndex((item) => item.id === version);
              const nextIdx = (currentIdx + 1) % BIBLE_VERSIONS.length;
              const nextVersion = BIBLE_VERSIONS[nextIdx].id;
              setVersion(nextVersion);
              loadVerseOfDay(nextVersion);
            }}
            hitSlop={8}
          >
            <Text style={[styles.versionBadge, { color: Colors.palette.coral }]}>
              {BIBLE_VERSIONS.find((item) => item.id === version)?.label ?? "NVI"}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.readingToolsRow, { borderBottomColor: theme.border }]}>
          <Pressable onPress={goToBooks} style={[styles.readingToolBtn, { backgroundColor: theme.card }]}>
            <Text style={[styles.readingToolText, { color: theme.text }]}>Livros</Text>
          </Pressable>
          <Pressable onPress={goToChapters} style={[styles.readingToolBtn, { backgroundColor: theme.card }]}>
            <Text style={[styles.readingToolText, { color: theme.text }]}>Capitulos</Text>
          </Pressable>
          <View style={[styles.verseJumpBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              style={[styles.verseJumpInput, { color: theme.text }]}
              value={verseInput}
              onChangeText={setVerseInput}
              keyboardType="number-pad"
              placeholder="Vers."
              placeholderTextColor={theme.textSecondary}
            />
            <Pressable onPress={goToVerse} style={styles.verseJumpBtn}>
              <Text style={[styles.verseJumpBtnText, { color: Colors.palette.coral }]}>Ir</Text>
            </Pressable>
          </View>
        </View>

        {loadingVerses ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.palette.coral} />
          </View>
        ) : (
          <FlatList
            ref={verseListRef}
            data={verses}
            keyExtractor={(item) => String(item.number)}
            contentContainerStyle={styles.readingContent}
            onScrollToIndexFailed={() => {
              setTimeout(() => goToVerse(), 300);
            }}
            ListHeaderComponent={
              chapterError ? (
                <View style={[styles.errorCard, { backgroundColor: Colors.palette.coral + "15" }]}>
                  <Text style={[styles.errorText, { color: theme.text }]}>{chapterError}</Text>
                  <Pressable
                    onPress={() => loadChapter(selectedBook, selectedChapter)}
                    style={[styles.retryBtn, { backgroundColor: Colors.palette.coral }]}
                  >
                    <Text style={styles.retryBtnText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : null
            }
            renderItem={({ item: verse }) => (
              <View
                style={[
                  styles.verseRow,
                  highlightVerse === verse.number
                    ? {
                        borderColor: Colors.palette.coral + "66",
                        backgroundColor: Colors.palette.coral + "12",
                      }
                    : null,
                ]}
              >
                <Text style={[styles.verseText, { color: theme.text }]}>
                  <Text style={[styles.verseNumber, { color: Colors.palette.coral }]}>
                    {verse.number}{" "}
                  </Text>
                  {verse.text}
                </Text>
              </View>
            )}
            ListFooterComponent={
              <View style={styles.chapterNav}>
                {selectedChapter > 1 && (
                  <Pressable
                    onPress={() => handleChapterSelect(selectedChapter - 1)}
                    style={[styles.chapterNavBtn, { backgroundColor: theme.card }]}
                  >
                    <Ionicons name="chevron-back" size={18} color={theme.text} />
                    <Text style={[styles.chapterNavText, { color: theme.text }]}>
                      Capitulo {selectedChapter - 1}
                    </Text>
                  </Pressable>
                )}
                {selectedChapter < selectedBook.chapters && (
                  <Pressable
                    onPress={() => handleChapterSelect(selectedChapter + 1)}
                    style={[styles.chapterNavBtn, { backgroundColor: theme.card, marginLeft: "auto" }]}
                  >
                    <Text style={[styles.chapterNavText, { color: theme.text }]}>
                      Capitulo {selectedChapter + 1}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.text} />
                  </Pressable>
                )}
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }

  if (viewMode === "chapters" && selectedBook) {
    const chapters = Array.from({ length: selectedBook.chapters }, (_, index) => index + 1);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.readingHeader, { borderBottomColor: theme.border }]}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.readingTitle, { color: theme.text }]}>{selectedBook.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.textSecondary, padding: 20 }]}>
          SELECIONE O CAPITULO
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
              <Text style={[styles.chapterCellText, { color: theme.text }]}>{item}</Text>
            </Pressable>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]}>Biblia</Text>
        </View>

        <View style={[styles.versionRow, { backgroundColor: theme.card }]}>
          {BIBLE_VERSIONS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setVersion(item.id);
                loadVerseOfDay(item.id);
              }}
              style={[
                styles.versionBtn,
                version === item.id ? { backgroundColor: Colors.palette.coral } : null,
              ]}
            >
              <Text
                style={[
                  styles.versionBtnText,
                  { color: version === item.id ? "#fff" : theme.textSecondary },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {verseOfDay ? (
          <View style={[styles.verseOfDayCard, { backgroundColor: Colors.palette.coral + "15" }]}>
            <Text style={[styles.verseOfDayLabel, { color: Colors.palette.coral }]}>
              VERSICULO DO DIA
            </Text>
            <Text style={[styles.verseOfDayText, { color: theme.text }]}>
              {"\""}
              {verseOfDay.text}
              {"\""}
            </Text>
            <Text style={[styles.verseOfDayRef, { color: theme.textSecondary }]}>
              - {verseOfDay.book.name} {verseOfDay.chapter}:{verseOfDay.number}
            </Text>
          </View>
        ) : null}
        {verseOfDayError ? (
          <Text style={[styles.inlineError, { color: Colors.palette.coral }]}>{verseOfDayError}</Text>
        ) : null}

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

        <View style={[styles.toggleRow, { backgroundColor: theme.card }]}>
          <Pressable
            onPress={() => setTestament("VT")}
            style={[styles.toggleBtn, testament === "VT" ? { backgroundColor: Colors.palette.coral } : null]}
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
            style={[styles.toggleBtn, testament === "NT" ? { backgroundColor: Colors.palette.coral } : null]}
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

        {loadingBooks ? (
          <ActivityIndicator size="large" color={Colors.palette.coral} style={{ marginTop: 40 }} />
        ) : (
          filteredBooks.map((book) => (
            <Pressable
              key={book.abbrev.pt}
              onPress={() => handleBookSelect(book)}
              style={[styles.bookRow, { borderBottomColor: theme.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.bookName, { color: theme.text }]}>{book.name}</Text>
                <Text style={[styles.bookMeta, { color: theme.textSecondary }]}>
                  {book.chapters} capitulos
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          ))
        )}

        {!loadingBooks && filteredBooks.length === 0 ? (
          <View>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhum livro encontrado</Text>
            {booksError ? (
              <View style={styles.center}>
                <Text style={[styles.inlineError, { color: Colors.palette.coral }]}>{booksError}</Text>
                <Pressable
                  onPress={loadBooks}
                  style={[styles.retryBtn, { backgroundColor: Colors.palette.coral, marginTop: 8 }]}
                >
                  <Text style={styles.retryBtnText}>Recarregar livros</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
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
  versionRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  versionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  versionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
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
  toggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
  },
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
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
  },
  inlineError: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 8,
  },
  errorCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 10,
  },
  retryBtn: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  sectionLabel: {
    ...Typography.label,
  },
  chapterGrid: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chapterCell: {
    width: 56,
    height: 56,
    borderRadius: 12,
    margin: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  chapterCellText: {
    fontSize: 18,
    fontWeight: "600",
  },
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
  readingToolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  readingToolBtn: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readingToolText: {
    fontSize: 12,
    fontWeight: "700",
  },
  verseJumpBox: {
    marginLeft: "auto",
    minWidth: 108,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  verseJumpInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  verseJumpBtn: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  verseJumpBtnText: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  readingContent: {
    padding: 24,
    paddingBottom: 100,
  },
  verseRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 10,
  },
  verseText: {
    ...Typography.contentSmall,
  },
  verseNumber: {
    ...Typography.caption,
    fontWeight: "800",
    fontSize: 11,
  },
  chapterNav: {
    flexDirection: "row",
    marginTop: 32,
    paddingTop: 20,
  },
  chapterNavBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  chapterNavText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
