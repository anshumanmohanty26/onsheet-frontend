"use client";

import { GOOGLE_FONT_FAMILIES } from "@/constants/fonts";
import { useEffect } from "react";

const LINK_ID = "onsheet-google-fonts";

/**
 * Lazily injects a single <link> element that loads all Google Fonts used by
 * the toolbar font selector. Called once when the Toolbar mounts.
 *
 * - Uses display=swap so no rendering is blocked.
 * - The CSS payload is tiny (~3 KB); actual font files are only downloaded
 *   by the browser when a cell actually uses that font-family.
 * - The <link> is de-duped by id so multiple Toolbar renders don't add
 *   duplicate entries.
 */
export function useGoogleFonts() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(LINK_ID)) return; // already injected

    const families = GOOGLE_FONT_FAMILIES.map(
      (f) => `family=${f.replace(/ /g, "+")}:wght@400;700`,
    ).join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;

    const link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }, []);
}
