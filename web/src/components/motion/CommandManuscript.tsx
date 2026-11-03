import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { springSilk } from "@/lib/motion-theme";
import { SearchIcon, BookOpenIcon, CompassIcon, SparklesIcon, XIcon } from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Stories" | "Collections" | "Characters" | "Values";
  href: string;
}

const DEFAULT_ITEMS: CommandItem[] = [
  // Collections
  { id: "col-ramayana", title: "Ramayana", subtitle: "The Path of Rama — Valmiki Ramayana", category: "Collections", href: "/collections/ramayana/" },
  { id: "col-mahabharata", title: "Mahabharata", subtitle: "The Great Epic of Dharma — Vyasa", category: "Collections", href: "/collections/mahabharata/" },
  { id: "col-shiva", title: "Shiva", subtitle: "Rudra Samhita — Shiva Purana", category: "Collections", href: "/collections/shiva/" },
  { id: "col-devi", title: "Devi", subtitle: "Devi Mahatmya — Markandeya Purana", category: "Collections", href: "/collections/devi/" },
  { id: "col-ganesha", title: "Ganesha & Family", subtitle: "Stories of wisdom, discernment & respect", category: "Collections", href: "/collections/ganesha/" },
  { id: "col-krishna", title: "Krishna", subtitle: "Gita & Bhagavata Purana", category: "Collections", href: "/collections/krishna/" },

  // Characters
  { id: "char-rama", title: "Rama", subtitle: "Maryada Purushottama · Valmiki Ramayana", category: "Characters", href: "/characters/rama/" },
  { id: "char-sita", title: "Sita", subtitle: "Daughter of the Earth, Courage & Truth", category: "Characters", href: "/characters/sita/" },
  { id: "char-hanuman", title: "Hanuman", subtitle: "Devotion, Selfless Strength & Presence", category: "Characters", href: "/characters/hanuman/" },
  { id: "char-valmiki", title: "Valmiki", subtitle: "First Poet · The Shloka Born of Compassion", category: "Characters", href: "/characters/valmiki/" },
  { id: "char-krishna", title: "Krishna", subtitle: "Counselor, Friend & Charioteer", category: "Characters", href: "/characters/krishna/" },
  { id: "char-shiva", title: "Shiva", subtitle: "Mahadeva · The Stillness Beyond Form", category: "Characters", href: "/characters/shiva/" },
  { id: "char-devi", title: "Devi", subtitle: "The Primordial Energy of Truth", category: "Characters", href: "/characters/devi/" },
  { id: "char-ganesha", title: "Ganesha", subtitle: "Remover of Obstacles, The Nearer World", category: "Characters", href: "/characters/ganesha/" },
  { id: "char-yudhishthira", title: "Yudhishthira", subtitle: "The Companion He Would Not Leave", category: "Characters", href: "/characters/yudhishthira/" },

  // Stories
  { id: "story-knowing-how-to-stop", title: "Knowing how to stop", subtitle: "Bala Kanda · Sita Svayamvara and the bow", category: "Stories", href: "/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/#page-5" },
  { id: "story-the-nearer-world", title: "The nearer world", subtitle: "Rudra Samhita · A journey around the earth", category: "Stories", href: "/collections/ganesha/books/shiva-purana/arcs/rudra-samhita/stories/ganesha-the-nearer-world/" },
  { id: "story-companion", title: "The companion he would not leave", subtitle: "Mahaprasthanika Parva · At the threshold of heaven", category: "Stories", href: "/collections/mahabharata/books/vyasa-mahabharata/arcs/mahaprasthanika-parva/stories/mahabharata-the-companion/" },
  { id: "story-two-requests", title: "Two requests beside the river", subtitle: "Devi Mahatmya · Suratha and Samadhi", category: "Stories", href: "/collections/devi/books/devi-mahatmya/arcs/uttama-charita/stories/devi-two-requests/" },

  // Values
  { id: "val-curiosity", title: "Curiosity", subtitle: "Stories driven by wonder and questioning", category: "Values", href: "/#stories" },
  { id: "val-discernment", title: "Discernment (विवेक)", subtitle: "The ability to distinguish truth from illusion", category: "Values", href: "/#stories" },
  { id: "val-compassion", title: "Compassion (करुणा)", subtitle: "Kindness extending to all living beings", category: "Values", href: "/#stories" },
  { id: "val-courage", title: "Courage (धैर्य)", subtitle: "Strength to act justly in adversity", category: "Values", href: "/#stories" },
  { id: "val-devotion", title: "Devotion (भक्ति)", subtitle: "Unwavering presence and heartfelt dedication", category: "Values", href: "/#stories" },
];

export function CommandManuscript() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-[#141210]/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={springSilk}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-[#FAF6EE] border border-[#141210]/15 shadow-2xl z-10"
          >
            <Command
              className="flex flex-col w-full text-[#141210]"
              label="Manuscript Search"
            >
              <div className="flex items-center border-b border-[#141210]/10 px-4 py-3">
                <SearchIcon className="mr-3 h-5 w-5 text-[#7A7064]" />
                <Command.Input
                  autoFocus
                  placeholder="Search stories, characters, values, or epics... (Esc to close)"
                  className="flex-1 bg-transparent text-base text-[#141210] placeholder-[#7A7064] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-[#7A7064] hover:bg-[#F3ECE0] hover:text-[#141210]"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <Command.List className="max-h-[380px] overflow-y-auto p-2 scroll-py-2">
                <Command.Empty className="py-8 text-center text-sm text-[#7A7064]">
                  No pages found in the Living Manuscript.
                </Command.Empty>

                {(["Collections", "Stories", "Characters", "Values"] as const).map(
                  (cat) => (
                    <Command.Group
                      key={cat}
                      heading={cat}
                      className="text-xs font-semibold text-[#7A7064] px-2 py-1.5"
                    >
                      {DEFAULT_ITEMS.filter((i) => i.category === cat).map((item) => (
                        <Command.Item
                          key={item.id}
                          value={`${item.title} ${item.subtitle || ""}`}
                          onSelect={() => {
                            setOpen(false);
                            window.location.href = item.href;
                          }}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm",
                            "transition-colors duration-150",
                            "hover:bg-[#F3ECE0] aria-selected:bg-[#F3ECE0] aria-selected:text-[#141210]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {cat === "Collections" && (
                              <CompassIcon className="h-4 w-4 text-[#B8860B]" />
                            )}
                            {cat === "Stories" && (
                              <BookOpenIcon className="h-4 w-4 text-[#C84B31]" />
                            )}
                            {cat === "Characters" && (
                              <SparklesIcon className="h-4 w-4 text-[#1E332E]" />
                            )}
                            {cat === "Values" && (
                              <span className="text-xs text-[#B8860B]">❧</span>
                            )}
                            <div>
                              <p className="font-serif font-medium text-[#141210]">
                                {item.title}
                              </p>
                              {item.subtitle && (
                                <p className="text-xs text-[#7A7064]">
                                  {item.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-[#7A7064]">Jump →</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )
                )}
              </Command.List>

              <div className="flex items-center justify-between border-t border-[#141210]/10 bg-[#F3ECE0]/50 px-4 py-2 text-xs text-[#7A7064]">
                <span>Navigate with ↑ ↓ and Enter</span>
                <span>The Living Manuscript · English &amp; हिन्दी</span>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
