import Link from "next/link";
import { ArrowRight, History, MapPin, Sparkles } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function AppCta({ compact = false }: { compact?: boolean }) {
  return (
    <section className="overflow-hidden border border-orange-200 bg-[linear-gradient(135deg,#431407,#9a3412_52%,#0f766e)] p-5 text-white shadow-[0_20px_60px_rgba(124,45,18,0.18)]">
      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 bg-white/10 px-2.5 py-1 text-xs font-black uppercase text-orange-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Mobile app
          </p>
          <h2 className={compact ? "mt-2 text-lg font-black text-white" : "mt-2 text-2xl font-black text-white"}>
            Dùng app để chọn món nhanh hơn
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-orange-50">
            App mobile có trải nghiệm đầy đủ hơn: lưu món đã thích, lịch sử gợi ý, tìm quán gần bạn và cá nhân hóa theo khẩu vị.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-orange-50">
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5">
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              Lưu lịch sử
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Quán gần bạn
            </span>
          </div>
          <p className="mt-3 text-xs text-orange-100">Nguồn app: {siteConfig.appCtaPath}</p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-white px-5 text-sm font-black text-stone-950 shadow-sm hover:bg-orange-50"
        >
          Thử random ngay
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
