/**
 * Bible Service — ABíbliaDigital API Integration
 *
 * API: https://www.abibliadigital.com.br/api/
 * Docs: https://www.abibliadigital.com.br/docs
 * Version: NVI (Nova Versão Internacional)
 *
 * Rate limits:
 * - Without token: 20 requests/hour/IP
 * - With token (free): Unlimited (register at abibliadigital.com.br)
 */

const BIBLE_API_URL = "https://www.abibliadigital.com.br/api";
const DEFAULT_VERSION = "nvi";

// All available PT-BR Bible versions
export const BIBLE_VERSIONS = [
    { id: "nvi", label: "NVI", fullName: "Nova Versão Internacional" },
    { id: "ra", label: "RA", fullName: "Almeida Revista e Atualizada" },
    { id: "acf", label: "ACF", fullName: "Almeida Corrigida e Fiel" },
] as const;

export type BibleVersionId = (typeof BIBLE_VERSIONS)[number]["id"];

// Token from env (optional, but recommended for unlimited requests)
const BIBLE_TOKEN =
    process.env.EXPO_PUBLIC_BIBLE_API_TOKEN ?? "";

// ─── Types ───────────────────────────────────────────────────

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

// ─── Book Abbreviation Mapping ───────────────────────────────

export const BOOK_ABBREVS: Record<string, string> = {
    // Antigo Testamento
    "Gênesis": "gn",
    "Êxodo": "ex",
    "Levítico": "lv",
    "Números": "nm",
    "Deuteronômio": "dt",
    "Josué": "js",
    "Juízes": "jz",
    "Rute": "rt",
    "1 Samuel": "1sm",
    "2 Samuel": "2sm",
    "1 Reis": "1rs",
    "2 Reis": "2rs",
    "1 Crônicas": "1cr",
    "2 Crônicas": "2cr",
    "Esdras": "ed",
    "Neemias": "ne",
    "Ester": "et",
    "Jó": "jó",
    "Salmos": "sl",
    "Provérbios": "pv",
    "Eclesiastes": "ec",
    "Cantares": "ct",
    "Isaías": "is",
    "Jeremias": "jr",
    "Lamentações": "lm",
    "Ezequiel": "ez",
    "Daniel": "dn",
    "Oséias": "os",
    "Joel": "jl",
    "Amós": "am",
    "Obadias": "ob",
    "Jonas": "jn",
    "Miquéias": "mq",
    "Naum": "na",
    "Habacuque": "hc",
    "Sofonias": "sf",
    "Ageu": "ag",
    "Zacarias": "zc",
    "Malaquias": "ml",
    // Novo Testamento
    "Mateus": "mt",
    "Marcos": "mc",
    "Lucas": "lc",
    "João": "jo",
    "Atos": "at",
    "Romanos": "rm",
    "1 Coríntios": "1co",
    "2 Coríntios": "2co",
    "Gálatas": "gl",
    "Efésios": "ef",
    "Filipenses": "fp",
    "Colossenses": "cl",
    "1 Tessalonicenses": "1ts",
    "2 Tessalonicenses": "2ts",
    "1 Timóteo": "1tm",
    "2 Timóteo": "2tm",
    "Tito": "tt",
    "Filemom": "fm",
    "Hebreus": "hb",
    "Tiago": "tg",
    "1 Pedro": "1pe",
    "2 Pedro": "2pe",
    "1 João": "1jo",
    "2 João": "2jo",
    "3 João": "3jo",
    "Judas": "jd",
    "Apocalipse": "ap",
};

// Reverse mapping (slug → name)
export const BOOK_NAMES: Record<string, string> = Object.fromEntries(
    Object.entries(BOOK_ABBREVS).map(([name, slug]) => [slug, name])
);

// ─── API Headers ─────────────────────────────────────────────

function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: "application/json",
    };
    if (BIBLE_TOKEN) {
        headers["Authorization"] = `Bearer ${BIBLE_TOKEN}`;
    }
    return headers;
}

// ─── API Functions ───────────────────────────────────────────

/**
 * Get a specific verse.
 * Example: getVerse("sl", 23, 1) → Salmos 23:1
 */
export async function getVerse(
    abbrev: string,
    chapter: number,
    verse: number,
    version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleVerseResponse> {
    const response = await fetch(
        `${BIBLE_API_URL}/verses/${version}/${abbrev}/${chapter}/${verse}`,
        { headers: getHeaders() }
    );
    if (!response.ok) {
        throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Get an entire chapter.
 * Example: getChapter("jo", 3) → João 3
 */
export async function getChapter(
    abbrev: string,
    chapter: number,
    version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleChapterResponse> {
    const response = await fetch(
        `${BIBLE_API_URL}/verses/${version}/${abbrev}/${chapter}`,
        { headers: getHeaders() }
    );
    if (!response.ok) {
        throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Get a random verse (useful for "Verse of the Day").
 */
export async function getRandomVerse(
    version: BibleVersionId = DEFAULT_VERSION
): Promise<BibleRandomVerseResponse> {
    const response = await fetch(
        `${BIBLE_API_URL}/verses/${version}/random`,
        { headers: getHeaders() }
    );
    if (!response.ok) {
        throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Get a range of verses from a chapter.
 * Fetches the full chapter and filters to the desired range.
 */
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

/**
 * Get all available books from the API.
 */
export async function getBooks(): Promise<BibleBook[]> {
    const response = await fetch(`${BIBLE_API_URL}/books`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Bible API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

/**
 * Convert a book name (PT-BR) to its API abbreviation.
 */
export function bookNameToAbbrev(name: string): string | undefined {
    return BOOK_ABBREVS[name];
}

/**
 * Convert an API abbreviation to the book name (PT-BR).
 */
export function abbrevToBookName(abbrev: string): string | undefined {
    return BOOK_NAMES[abbrev];
}
