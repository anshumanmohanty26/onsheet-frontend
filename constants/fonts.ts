export interface FontDefinition {
  label: string;
  /** CSS font-family value used in cell style. "Default" means inherit. */
  value: string;
  /** true = must be fetched from Google Fonts */
  google?: boolean;
}

/** System fonts — always available, no network request needed. */
const SYSTEM_FONTS: FontDefinition[] = [
  { label: "Default", value: "Default" },
  { label: "Arial", value: "Arial" },
  { label: "Arial Black", value: "Arial Black" },
  { label: "Calibri", value: "Calibri" },
  { label: "Courier New", value: "Courier New" },
  { label: "Georgia", value: "Georgia" },
  { label: "Helvetica Neue", value: "Helvetica Neue" },
  { label: "Impact", value: "Impact" },
  { label: "Palatino", value: "Palatino" },
  { label: "Tahoma", value: "Tahoma" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
  { label: "Verdana", value: "Verdana" },
];

/** Google Fonts — loaded lazily via a single CSS API request. */
const GOOGLE_FONTS: FontDefinition[] = [
  { label: "DM Sans", value: "DM Sans", google: true },
  { label: "Fira Code", value: "Fira Code", google: true },
  { label: "IBM Plex Mono", value: "IBM Plex Mono", google: true },
  { label: "IBM Plex Sans", value: "IBM Plex Sans", google: true },
  { label: "Inter", value: "Inter", google: true },
  { label: "Lato", value: "Lato", google: true },
  { label: "Merriweather", value: "Merriweather", google: true },
  { label: "Montserrat", value: "Montserrat", google: true },
  { label: "Nunito", value: "Nunito", google: true },
  { label: "Open Sans", value: "Open Sans", google: true },
  { label: "Oswald", value: "Oswald", google: true },
  { label: "Playfair Display", value: "Playfair Display", google: true },
  { label: "Poppins", value: "Poppins", google: true },
  { label: "PT Mono", value: "PT Mono", google: true },
  { label: "PT Serif", value: "PT Serif", google: true },
  { label: "Raleway", value: "Raleway", google: true },
  { label: "Roboto", value: "Roboto", google: true },
  { label: "Roboto Mono", value: "Roboto Mono", google: true },
  { label: "Source Code Pro", value: "Source Code Pro", google: true },
  { label: "Ubuntu", value: "Ubuntu", google: true },
  { label: "Work Sans", value: "Work Sans", google: true },
];

export const FONT_LIST: FontDefinition[] = [...SYSTEM_FONTS, ...GOOGLE_FONTS];

/** Font-family names that require Google Fonts (used to build the CSS API URL). */
export const GOOGLE_FONT_FAMILIES = GOOGLE_FONTS.map((f) => f.value);
