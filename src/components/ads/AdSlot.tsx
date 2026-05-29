type AdSlotProps = {
  id: string;
  format: "horizontal" | "rectangle" | "sidebar" | "in-content";
  className?: string;
};

const sizeClass = {
  horizontal: "min-h-[96px]",
  rectangle: "min-h-[250px]",
  sidebar: "min-h-[320px]",
  "in-content": "min-h-[140px]",
};

export function AdSlot({ id, format, className = "" }: AdSlotProps) {
  return (
    <aside
      id={id}
      aria-label="Vị trí quảng cáo"
      className={`flex w-full items-center justify-center border border-dashed border-orange-200 bg-[linear-gradient(135deg,#fff7ed,#ffffff)] text-xs font-bold uppercase tracking-[0.18em] text-orange-700 ${sizeClass[format]} ${className}`}
      data-ad-format={format}
    >
      <span className="rounded-full bg-white px-3 py-1 shadow-sm">Quảng cáo</span>
    </aside>
  );
}
