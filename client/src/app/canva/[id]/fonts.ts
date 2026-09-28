import {
  Bebas_Neue,
  Cinzel,
  Dancing_Script,
  Great_Vibes,
  Metal_Mania,
  Oswald,
  Pacifico,
  Permanent_Marker,
  Pirata_One,
  Playfair_Display,
  UnifrakturMaguntia,
} from "next/font/google";

const unifraktur = UnifrakturMaguntia({ weight: "400", subsets: ["latin"], preload: false });
const pirataOne = Pirata_One({ weight: "400", subsets: ["latin"], preload: false });
const metalMania = Metal_Mania({ weight: "400", subsets: ["latin"], preload: false });
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], preload: false });
const dancingScript = Dancing_Script({ weight: "700", subsets: ["latin"], preload: false });
const pacifico = Pacifico({ weight: "400", subsets: ["latin"], preload: false });
const permanentMarker = Permanent_Marker({ weight: "400", subsets: ["latin"], preload: false });
const cinzel = Cinzel({ weight: "600", subsets: ["latin"], preload: false });
const playfair = Playfair_Display({ weight: "700", subsets: ["latin"], preload: false });
const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], preload: false });
const oswald = Oswald({ weight: "500", subsets: ["latin"], preload: false });

export interface CanvaFont {
  key: string;
  label: string;
  family: string;
}

export const CANVA_FONTS: CanvaFont[] = [
  { key: "UnifrakturMaguntia", label: "Blackletter", family: unifraktur.style.fontFamily },
  { key: "Pirata One", label: "Gothic", family: pirataOne.style.fontFamily },
  { key: "Metal Mania", label: "Metal", family: metalMania.style.fontFamily },
  { key: "Great Vibes", label: "Script", family: greatVibes.style.fontFamily },
  { key: "Dancing Script", label: "Handwritten", family: dancingScript.style.fontFamily },
  { key: "Pacifico", label: "Retro Script", family: pacifico.style.fontFamily },
  { key: "Permanent Marker", label: "Marker", family: permanentMarker.style.fontFamily },
  { key: "Cinzel", label: "Roman Capitals", family: cinzel.style.fontFamily },
  { key: "Playfair Display", label: "Serif Display", family: playfair.style.fontFamily },
  { key: "Bebas Neue", label: "Bold Condensed", family: bebasNeue.style.fontFamily },
  { key: "Oswald", label: "Sans Condensed", family: oswald.style.fontFamily },
  { key: "Georgia", label: "Georgia", family: "Georgia, serif" },
  { key: "Times New Roman", label: "Times New Roman", family: "'Times New Roman', serif" },
  { key: "Arial", label: "Arial", family: "Arial, sans-serif" },
  { key: "Courier New", label: "Typewriter", family: "'Courier New', monospace" },
  { key: "Impact", label: "Impact", family: "Impact, sans-serif" },
];

export const DEFAULT_CANVA_FONT = CANVA_FONTS[0].key;

export function canvaFontFamily(key: string): string {
  return CANVA_FONTS.find((font) => font.key === key)?.family ?? key;
}
