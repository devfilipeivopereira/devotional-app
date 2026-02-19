/**
 * Typography system for the Devocional app.
 *
 * Uses:
 * - Nunito (sans-serif) — UI elements, navigation, labels
 * - Serif system fallback — Devotional content (quotes, scripture, reflections)
 *
 * Note: We use system serif fonts for content to avoid extra font loading.
 * On iOS this gets Georgia/New York, on Android it gets Noto Serif.
 * For a future upgrade, install @expo-google-fonts/playfair-display.
 */

import { Platform, TextStyle } from "react-native";

const SERIF_FAMILY = Platform.select({
    ios: "Georgia",
    android: "serif",
    web: "'Georgia', 'Times New Roman', serif",
}) as string;

const SANS_FAMILY = Platform.select({
    ios: "System",
    android: "sans-serif",
    web: "'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
}) as string;

export const Typography = {
    // ─── Display (Hero text, splash) ─────────────────────────
    displayLarge: {
        fontFamily: SERIF_FAMILY,
        fontSize: 34,
        fontWeight: "300" as const,
        lineHeight: 44,
        letterSpacing: -0.5,
    } as TextStyle,

    displayMedium: {
        fontFamily: SERIF_FAMILY,
        fontSize: 28,
        fontWeight: "300" as const,
        lineHeight: 38,
    } as TextStyle,

    // ─── Headings ────────────────────────────────────────────
    headingLarge: {
        fontFamily: SANS_FAMILY,
        fontSize: 28,
        fontWeight: "700" as const,
        lineHeight: 36,
    } as TextStyle,

    headingMedium: {
        fontFamily: SANS_FAMILY,
        fontSize: 22,
        fontWeight: "700" as const,
        lineHeight: 30,
    } as TextStyle,

    headingSmall: {
        fontFamily: SANS_FAMILY,
        fontSize: 18,
        fontWeight: "700" as const,
        lineHeight: 26,
    } as TextStyle,

    // ─── Body ────────────────────────────────────────────────
    bodyLarge: {
        fontFamily: SANS_FAMILY,
        fontSize: 17,
        fontWeight: "400" as const,
        lineHeight: 26,
    } as TextStyle,

    bodyMedium: {
        fontFamily: SANS_FAMILY,
        fontSize: 15,
        fontWeight: "400" as const,
        lineHeight: 22,
    } as TextStyle,

    bodySmall: {
        fontFamily: SANS_FAMILY,
        fontSize: 13,
        fontWeight: "400" as const,
        lineHeight: 20,
    } as TextStyle,

    // ─── Content (Devotional reading) ────────────────────────
    contentLarge: {
        fontFamily: SERIF_FAMILY,
        fontSize: 24,
        fontWeight: "400" as const,
        lineHeight: 38,
    } as TextStyle,

    contentMedium: {
        fontFamily: SERIF_FAMILY,
        fontSize: 20,
        fontWeight: "400" as const,
        lineHeight: 32,
    } as TextStyle,

    contentSmall: {
        fontFamily: SERIF_FAMILY,
        fontSize: 17,
        fontWeight: "400" as const,
        lineHeight: 28,
    } as TextStyle,

    // ─── Quote ───────────────────────────────────────────────
    quote: {
        fontFamily: SERIF_FAMILY,
        fontSize: 28,
        fontWeight: "300" as const,
        fontStyle: "italic" as const,
        lineHeight: 40,
    } as TextStyle,

    // ─── Labels & UI ─────────────────────────────────────────
    label: {
        fontFamily: SANS_FAMILY,
        fontSize: 12,
        fontWeight: "700" as const,
        letterSpacing: 1.5,
        textTransform: "uppercase" as const,
    } as TextStyle,

    labelSmall: {
        fontFamily: SANS_FAMILY,
        fontSize: 11,
        fontWeight: "700" as const,
        letterSpacing: 2,
        textTransform: "uppercase" as const,
    } as TextStyle,

    button: {
        fontFamily: SANS_FAMILY,
        fontSize: 15,
        fontWeight: "700" as const,
        letterSpacing: 0.5,
    } as TextStyle,

    caption: {
        fontFamily: SANS_FAMILY,
        fontSize: 12,
        fontWeight: "500" as const,
        lineHeight: 18,
    } as TextStyle,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
};

export default { Typography, Spacing, Radius };
