import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-paper-base text-paper-text">
      <span className="text-xs uppercase tracking-widest text-gold-leaf font-semibold mb-2">
        Folio Not Found
      </span>
      <h2 className="font-retelling text-3xl md:text-4xl font-medium mb-3">
        This Leaf Has Not Been Inscribed
      </h2>
      <p className="text-xs text-paper-muted max-w-md mx-auto mb-8">
        The story or path you sought does not exist in this edition of the manuscript.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-gold-leaf text-ink-black text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
      >
        Return to the Sanctuary
      </Link>
    </div>
  );
}
