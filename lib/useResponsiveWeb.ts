import { Platform } from "react-native";
import { useWindowDimensions } from "react-native";

/** Largura máxima do conteúdo em desktop (web) para boa leitura */
export const WEB_CONTENT_MAX_WIDTH = 480;

/** Breakpoint a partir do qual considerar "desktop" para ajustes de layout */
export const WEB_DESKTOP_BREAKPOINT = 600;

export function useResponsiveWeb() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktopWeb = isWeb && width >= WEB_DESKTOP_BREAKPOINT;

  return {
    isWeb,
    isDesktopWeb,
    contentMaxWidth: WEB_CONTENT_MAX_WIDTH,
    windowWidth: width,
  };
}
