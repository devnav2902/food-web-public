import Image from "next/image";

export function DishImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex aspect-[4/3] items-center justify-center bg-orange-100 text-sm text-orange-900 ${className}`}>
        Chưa có ảnh
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={675}
      priority={priority}
      className={`aspect-[4/3] w-full object-cover ${className}`}
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    />
  );
}
