import Link from "next/link";
import { BookOpen, Dice5 } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-orange-100 bg-[#fffaf3]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-black tracking-tight text-stone-950 sm:text-lg"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-stone-950 text-white shadow-sm">
            <Dice5 className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>Hôm Nay Ăn Gì?</span>
        </Link>
        <nav
          aria-label="Điều hướng chính"
          className="flex items-center gap-2 text-sm font-bold text-stone-700 sm:gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-white px-3 py-2 shadow-sm hover:text-orange-700"
          >
            <Dice5 className="h-4 w-4" aria-hidden="true" />
            Random món
          </Link>
        </nav>
      </div>
    </header>
  );
}
