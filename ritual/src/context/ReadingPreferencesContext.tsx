"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type PaperTone = "palm-leaf" | "vellum" | "night" | "high-contrast";
export type TextSize = "sm" | "base" | "lg" | "xl";
export type ReadingMode = "folio" | "flow" | "bilingual";
export type LanguageChoice = "en" | "hi" | "bilingual";

interface ReadingPreferencesContextType {
  paperTone: PaperTone;
  setPaperTone: (tone: PaperTone) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  readingMode: ReadingMode;
  setReadingMode: (mode: ReadingMode) => void;
  language: LanguageChoice;
  setLanguage: (lang: LanguageChoice) => void;
  isPatron: boolean;
  setIsPatron: (val: boolean) => void;
  savedFolios: string[];
  toggleSaveFolio: (id: string) => void;
}

const ReadingPreferencesContext = createContext<ReadingPreferencesContextType>({
  paperTone: "palm-leaf",
  setPaperTone: () => {},
  textSize: "base",
  setTextSize: () => {},
  readingMode: "flow",
  setReadingMode: () => {},
  language: "en",
  setLanguage: () => {},
  isPatron: false,
  setIsPatron: () => {},
  savedFolios: [],
  toggleSaveFolio: () => {},
});

export function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [paperTone, setPaperToneState] = useState<PaperTone>("palm-leaf");
  const [textSize, setTextSizeState] = useState<TextSize>("base");
  const [readingMode, setReadingModeState] = useState<ReadingMode>("flow");
  const [language, setLanguageState] = useState<LanguageChoice>("en");
  const [isPatron, setIsPatronState] = useState(false);
  const [savedFolios, setSavedFolios] = useState<string[]>([]);

  useEffect(() => {
    const savedTone = localStorage.getItem("spritual_tone") as PaperTone | null;
    if (savedTone && ["palm-leaf", "vellum", "night", "high-contrast"].includes(savedTone)) {
      setPaperToneState(savedTone);
      document.documentElement.setAttribute("data-tone", savedTone);
    } else {
      document.documentElement.setAttribute("data-tone", "palm-leaf");
    }

    const savedSize = localStorage.getItem("spritual_text_size") as TextSize | null;
    if (savedSize) setTextSizeState(savedSize);

    const savedMode = localStorage.getItem("spritual_reading_mode") as ReadingMode | null;
    if (savedMode) setReadingModeState(savedMode);

    const savedLang = localStorage.getItem("spritual_language") as LanguageChoice | null;
    if (savedLang) setLanguageState(savedLang);

    const savedPatron = localStorage.getItem("spritual_is_patron") === "true";
    setIsPatronState(savedPatron);

    const savedList = localStorage.getItem("spritual_saved_folios");
    if (savedList) {
      try {
        setSavedFolios(JSON.parse(savedList));
      } catch {}
    }
  }, []);

  const setPaperTone = (tone: PaperTone) => {
    setPaperToneState(tone);
    localStorage.setItem("spritual_tone", tone);
    document.documentElement.setAttribute("data-tone", tone);
  };

  const setTextSize = (size: TextSize) => {
    setTextSizeState(size);
    localStorage.setItem("spritual_text_size", size);
  };

  const setReadingMode = (mode: ReadingMode) => {
    setReadingModeState(mode);
    localStorage.setItem("spritual_reading_mode", mode);
  };

  const setLanguage = (lang: LanguageChoice) => {
    setLanguageState(lang);
    localStorage.setItem("spritual_language", lang);
  };

  const setIsPatron = (val: boolean) => {
    setIsPatronState(val);
    localStorage.setItem("spritual_is_patron", String(val));
  };

  const toggleSaveFolio = (id: string) => {
    setSavedFolios((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("spritual_saved_folios", JSON.stringify(next));
      return next;
    });
  };

  return (
    <ReadingPreferencesContext.Provider
      value={{
        paperTone,
        setPaperTone,
        textSize,
        setTextSize,
        readingMode,
        setReadingMode,
        language,
        setLanguage,
        isPatron,
        setIsPatron,
        savedFolios,
        toggleSaveFolio,
      }}
    >
      {children}
    </ReadingPreferencesContext.Provider>
  );
}

export const useReadingPreferences = () => useContext(ReadingPreferencesContext);
