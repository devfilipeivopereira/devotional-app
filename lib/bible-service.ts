const PRIMARY_API_URL = "https://www.abibliadigital.com.br/api";
const SECONDARY_API_URL = "https://bible-api.com";
const DEFAULT_VERSION = "nvi";
const REQUEST_TIMEOUT_MS = 12000;

export const BIBLE_VERSIONS = [
  { id: "nvi", label: "NVI", fullName: "Nova Versao Internacional" },
  { id: "ra", label: "RA", fullName: "Almeida Revista e Atualizada" },
  { id: "acf", label: "ACF", fullName: "Almeida Corrigida e Fiel" },
] as const;

export type BibleVersionId = (typeof BIBLE_VERSIONS)[number]["id"];

const BIBLE_TOKEN =
  process.env.EXPO_PUBLIC_BIBLE_API_TOKEN ??
  process.env.EXPO_PUBLIC_ABIBLIA_TOKEN ??
  "";

export interface BibleVerse {
  number: number;
  text: string;
}

export interface BibleChapterResponse {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: {
    number: number;
    verses: number;
  };
  verses: BibleVerse[];
}

export interface BibleVerseResponse {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: number;
  number: number;
  text: string;
}

export interface BibleRandomVerseResponse {
  book: {
    abbrev: { pt: string; en: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: number;
  number: number;
  text: string;
}

export interface BibleBook {
  abbrev: { pt: string; en: string };
  name: string;
  author: string;
  group: string;
  chapters: number;
  testament: "VT" | "NT";
}

type CanonicalBook = {
  pt: string;
  en: string;
  abbrev: string;
  chapters: number;
  testament: "VT" | "NT";
};

const CANONICAL_BOOKS: CanonicalBook[] = [
  { pt: "Genesis", en: "Genesis", abbrev: "gn", chapters: 50, testament: "VT" },
  { pt: "Exodo", en: "Exodus", abbrev: "ex", chapters: 40, testament: "VT" },
  { pt: "Levitico", en: "Leviticus", abbrev: "lv", chapters: 27, testament: "VT" },
  { pt: "Numeros", en: "Numbers", abbrev: "nm", chapters: 36, testament: "VT" },
  { pt: "Deuteronomio", en: "Deuteronomy", abbrev: "dt", chapters: 34, testament: "VT" },
  { pt: "Josue", en: "Joshua", abbrev: "js", chapters: 24, testament: "VT" },
  { pt: "Juizes", en: "Judges", abbrev: "jz", chapters: 21, testament: "VT" },
  { pt: "Rute", en: "Ruth", abbrev: "rt", chapters: 4, testament: "VT" },
  { pt: "1 Samuel", en: "1 Samuel", abbrev: "1sm", chapters: 31, testament: "VT" },
  { pt: "2 Samuel", en: "2 Samuel", abbrev: "2sm", chapters: 24, testament: "VT" },
  { pt: "1 Reis", en: "1 Kings", abbrev: "1rs", chapters: 22, testament: "VT" },
  { pt: "2 Reis", en: "2 Kings", abbrev: "2rs", chapters: 25, testament: "VT" },
  { pt: "1 Cronicas", en: "1 Chronicles", abbrev: "1cr", chapters: 29, testament: "VT" },
  { pt: "2 Cronicas", en: "2 Chronicles", abbrev: "2cr", chapters: 36, testament: "VT" },
  { pt: "Esdras", en: "Ezra", abbrev: "ed", chapters: 10, testament: "VT" },
  { pt: "Neemias", en: "Nehemiah", abbrev: "ne", chapters: 13, testament: "VT" },
  { pt: "Ester", en: "Esther", abbrev: "et", chapters: 10, testament: "VT" },
  { pt: "Jo", en: "Job", abbrev: "job", chapters: 42, testament: "VT" },
  { pt: "Salmos", en: "Psalms", abbrev: "sl", chapters: 150, testament: "VT" },
  { pt: "Proverbios", en: "Proverbs", abbrev: "pv", chapters: 31, testament: "VT" },
  { pt: "Eclesiastes", en: "Ecclesiastes", abbrev: "ec", chapters: 12, testament: "VT" },
  { pt: "Cantares", en: "Song of Solomon", abbrev: "ct", chapters: 8, testament: "VT" },
  { pt: "Isaias", en: "Isaiah", abbrev: "is", chapters: 66, testament: "VT" },
  { pt: "Jeremias", en: "Jeremiah", abbrev: "jr", chapters: 52, testament: "VT" },
  { pt: "Lamentacoes", en: "Lamentations", abbrev: "lm", chapters: 5, testament: "VT" },
  { pt: "Ezequiel", en: "Ezekiel", abbrev: "ez", chapters: 48, testament: "VT" },
  { pt: "Daniel", en: "Daniel", abbrev: "dn", chapters: 12, testament: "VT" },
  { pt: "Oseias", en: "Hosea", abbrev: "os", chapters: 14, testament: "VT" },
  { pt: "Joel", en: "Joel", abbrev: "jl", chapters: 3, testament: "VT" },
  { pt: "Amos", en: "Amos", abbrev: "am", chapters: 9, testament: "VT" },
  { pt: "Obadias", en: "Obadiah", abbrev: "ob", chapters: 1, testament: "VT" },
  { pt: "Jonas", en: "Jonah", abbrev: "jn", chapters: 4, testament: "VT" },
  { pt: "Miqueias", en: "Micah", abbrev: "mq", chapters: 7, testament: "VT" },
  { pt: "Naum", en: "Nahum", abbrev: "na", chapters: 3, testament: "VT" },
  { pt: "Habacuque", en: "Habakkuk", abbrev: "hc", chapters: 3, testament: "VT" },
  { pt: "Sofonias", en: "Zephaniah", abbrev: "sf", chapters: 3, testament: "VT" },
  { pt: "Ageu", en: "Haggai", abbrev: "ag", chapters: 2, testament: "VT" },
  { pt: "Zacarias", en: "Zechariah", abbrev: "zc", chapters: 14, testament: "VT" },
  { pt: "Malaquias", en: "Malachi", abbrev: "ml", chapters: 4, testament: "VT" },
  { pt: "Mateus", en: "Matthew", abbrev: "mt", chapters: 28, testament: "NT" },
  { pt: "Marcos", en: "Mark", abbrev: "mc", chapters: 16, testament: "NT" },
  { pt: "Lucas", en: "Luke", abbrev: "lc", chapters: 24, testament: "NT" },
  { pt: "Joao", en: "John", abbrev: "jo", chapters: 21, testament: "NT" },
  { pt: "Atos", en: "Acts", abbrev: "at", chapters: 28, testament: "NT" },
  { pt: "Romanos", en: "Romans", abbrev: "rm", chapters: 16, testament: "NT" },
  { pt: "1 Corintios", en: "1 Corinthians", abbrev: "1co", chapters: 16, testament: "NT" },
  { pt: "2 Corintios", en: "2 Corinthians", abbrev: "2co", chapters: 13, testament: "NT" },
  { pt: "Galatas", en: "Galatians", abbrev: "gl", chapters: 6, testament: "NT" },
  { pt: "Efesios", en: "Ephesians", abbrev: "ef", chapters: 6, testament: "NT" },
  { pt: "Filipenses", en: "Philippians", abbrev: "fp", chapters: 4, testament: "NT" },
  { pt: "Colossenses", en: "Colossians", abbrev: "cl", chapters: 4, testament: "NT" },
  { pt: "1 Tessalonicenses", en: "1 Thessalonians", abbrev: "1ts", chapters: 5, testament: "NT" },
  { pt: "2 Tessalonicenses", en: "2 Thessalonians", abbrev: "2ts", chapters: 3, testament: "NT" },
  { pt: "1 Timoteo", en: "1 Timothy", abbrev: "1tm", chapters: 6, testament: "NT" },
  { pt: "2 Timoteo", en: "2 Timothy", abbrev: "2tm", chapters: 4, testament: "NT" },
  { pt: "Tito", en: "Titus", abbrev: "tt", chapters: 3, testament: "NT" },
  { pt: "Filemom", en: "Philemon", abbrev: "fm", chapters: 1, testament: "NT" },
  { pt: "Hebreus", en: "Hebrews", abbrev: "hb", chapters: 13, testament: "NT" },
  { pt: "Tiago", en: "James", abbrev: "tg", chapters: 5, testament: "NT" },
  { pt: "1 Pedro", en: "1 Peter", abbrev: "1pe", chapters: 5, testament: "NT" },
  { pt: "2 Pedro", en: "2 Peter", abbrev: "2pe", chapters: 3, testament: "NT" },
  { pt: "1 Joao", en: "1 John", abbrev: "1jo", chapters: 5, testament: "NT" },
  { pt: "2 Joao", en: "2 John", abbrev: "2jo", chapters: 1, testament: "NT" },
  { pt: "3 Joao", en: "3 John", abbrev: "3jo", chapters: 1, testament: "NT" },
  { pt: "Judas", en: "Jude", abbrev: "jd", chapters: 1, testament: "NT" },
  { pt: "Apocalipse", en: "Revelation", abbrev: "ap", chapters: 22, testament: "NT" },
];

const PT_BOOK_NAMES: Record<string, string> = {
  gn: "Gênesis",
  ex: "Êxodo",
  lv: "Levítico",
  nm: "Números",
  dt: "Deuteronômio",
  js: "Josué",
  jz: "Juízes",
  rt: "Rute",
  "1sm": "1 Samuel",
  "2sm": "2 Samuel",
  "1rs": "1 Reis",
  "2rs": "2 Reis",
  "1cr": "1 Crônicas",
  "2cr": "2 Crônicas",
  ed: "Esdras",
  ne: "Neemias",
  et: "Ester",
  job: "Jó",
  sl: "Salmos",
  pv: "Provérbios",
  ec: "Eclesiastes",
  ct: "Cânticos",
  is: "Isaías",
  jr: "Jeremias",
  lm: "Lamentações",
  ez: "Ezequiel",
  dn: "Daniel",
  os: "Oséias",
  jl: "Joel",
  am: "Amós",
  ob: "Obadias",
  jn: "Jonas",
  mq: "Miquéias",
  na: "Naum",
  hc: "Habacuque",
  sf: "Sofonias",
  ag: "Ageu",
  zc: "Zacarias",
  ml: "Malaquias",
  mt: "Mateus",
  mc: "Marcos",
  lc: "Lucas",
  jo: "João",
  at: "Atos",
  rm: "Romanos",
  "1co": "1 Coríntios",
  "2co": "2 Coríntios",
  gl: "Gálatas",
  ef: "Efésios",
  fp: "Filipenses",
  cl: "Colossenses",
  "1ts": "1 Tessalonicenses",
  "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo",
  "2tm": "2 Timóteo",
  tt: "Tito",
  fm: "Filemom",
  hb: "Hebreus",
  tg: "Tiago",
  "1pe": "1 Pedro",
  "2pe": "2 Pedro",
  "1jo": "1 João",
  "2jo": "2 João",
  "3jo": "3 João",
  jd: "Judas",
  ap: "Apocalipse",
};

const FALLBACK_BOOKS: BibleBook[] = CANONICAL_BOOKS.map((book) => ({
  abbrev: { pt: book.abbrev, en: book.en.toLowerCase().replace(/\s+/g, "") },
  name: PT_BOOK_NAMES[book.abbrev] ?? book.pt,
  author: "",
  group: "",
  chapters: book.chapters,
  testament: book.testament,
}));

const ABBREV_TO_ENGLISH: Record<string, string> = Object.fromEntries(
  CANONICAL_BOOKS.map((book) => [book.abbrev, book.en])
);

const BOOK_NAME_ALIASES: Record<string, string> = {
  "genesis": "gn",
  "genesisis": "gn",
  "exodo": "ex",
  "levitico": "lv",
  "numeros": "nm",
  "deuteronomio": "dt",
  "josue": "js",
  "juizes": "jz",
  "joao": "jo",
  "jó": "job",
  "jo": "jo",
  "job": "job",
};

export const BOOK_ABBREVS: Record<string, string> = Object.fromEntries(
  Object.entries(PT_BOOK_NAMES).map(([abbrev, name]) => [name, abbrev])
);

export const BOOK_NAMES: Record<string, string> = PT_BOOK_NAMES;

function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (BIBLE_TOKEN) headers.Authorization = `Bearer ${BIBLE_TOKEN}`;
  return headers;
}

async function fetchJson<T>(url: string, headers?: Record<string, string>): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function getChapterFromSecondary(abbrev: string, chapter: number): Promise<BibleChapterResponse> {
  const englishBook = ABBREV_TO_ENGLISH[abbrev];
  if (!englishBook) throw new Error("Livro nao suportado no fallback");
  const reference = encodeURIComponent(`${englishBook} ${chapter}`);
  const data = await fetchJson<{
    verses: Array<{ verse: number; text: string }>;
  }>(`${SECONDARY_API_URL}/${reference}?translation=almeida`);

  return {
    book: {
      abbrev: { pt: abbrev, en: englishBook.toLowerCase().replace(/\s+/g, "") },
      name: BOOK_NAMES[abbrev] ?? englishBook,
      author: "",
      group: "",
      version: "fallback",
    },
    chapter: {
      number: chapter,
      verses: data.verses?.length ?? 0,
    },
    verses: (data.verses ?? []).map((verse) => ({
      number: verse.verse,
      text: verse.text,
    })),
  };
}

async function getVerseFromSecondary(abbrev: string, chapter: number, verse: number): Promise<BibleVerseResponse> {
  const chapterData = await getChapterFromSecondary(abbrev, chapter);
  const selectedVerse = chapterData.verses.find((item) => item.number === verse);
  if (!selectedVerse) throw new Error("Versiculo nao encontrado");
  return {
    book: chapterData.book,
    chapter,
    number: verse,
    text: selectedVerse.text,
  };
}

export async function getVerse(
  abbrev: string,
  chapter: number,
  verse: number,
  version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleVerseResponse> {
  try {
    return await fetchJson<BibleVerseResponse>(
      `${PRIMARY_API_URL}/verses/${version}/${abbrev}/${chapter}/${verse}`,
      getHeaders()
    );
  } catch {
    return getVerseFromSecondary(abbrev, chapter, verse);
  }
}

export async function getChapter(
  abbrev: string,
  chapter: number,
  version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleChapterResponse> {
  try {
    return await fetchJson<BibleChapterResponse>(
      `${PRIMARY_API_URL}/verses/${version}/${abbrev}/${chapter}`,
      getHeaders()
    );
  } catch {
    return getChapterFromSecondary(abbrev, chapter);
  }
}

export async function getRandomVerse(
  version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleRandomVerseResponse> {
  try {
    return await fetchJson<BibleRandomVerseResponse>(
      `${PRIMARY_API_URL}/verses/${version}/random`,
      getHeaders()
    );
  } catch {
    const references = [
      { abbrev: "sl", chapter: 23, verse: 1 },
      { abbrev: "pv", chapter: 3, verse: 5 },
      { abbrev: "mt", chapter: 11, verse: 28 },
      { abbrev: "jo", chapter: 3, verse: 16 },
      { abbrev: "rm", chapter: 8, verse: 28 },
    ];
    const pick = references[Math.floor(Math.random() * references.length)];
    const verse = await getVerseFromSecondary(pick.abbrev, pick.chapter, pick.verse);
    return {
      ...verse,
    };
  }
}

export async function getVerseRange(
  abbrev: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  version: BibleVersionId = DEFAULT_VERSION
): Promise<{ book: string; chapter: number; verses: BibleVerse[] }> {
  const data = await getChapter(abbrev, chapter, version);
  const filteredVerses = data.verses.filter(
    (v) => v.number >= verseStart && v.number <= verseEnd
  );
  return {
    book: data.book.name,
    chapter: data.chapter.number,
    verses: filteredVerses,
  };
}

export async function getBooks(): Promise<BibleBook[]> {
  try {
    const books = await fetchJson<BibleBook[]>(`${PRIMARY_API_URL}/books`, getHeaders());
    return books.map((book) => ({
      ...book,
      name: BOOK_NAMES[book.abbrev.pt] ?? book.name,
    }));
  } catch {
    return FALLBACK_BOOKS;
  }
}

export function bookNameToAbbrev(name: string): string | undefined {
  const normalized = normalizeKey(name);
  const alias = BOOK_NAME_ALIASES[normalized];
  if (alias) return alias;

  const byCanonical = CANONICAL_BOOKS.find(
    (book) => normalizeKey(book.pt) === normalized
  );
  if (byCanonical) return byCanonical.abbrev;

  return BOOK_ABBREVS[name];
}

export function abbrevToBookName(abbrev: string): string | undefined {
  return BOOK_NAMES[abbrev];
}
