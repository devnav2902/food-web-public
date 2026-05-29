import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-orange-100 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-white">Hôm Nay Ăn Gì?</p>
          <p className="mt-2 text-sm text-stone-400">
            Random món ăn nhanh, vui và dễ dùng lại mỗi ngày.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Công cụ</p>
          <Link href="/" className="mt-2 block text-stone-400 hover:text-white">
            Random món ăn
          </Link>
        </div>
        <div className="text-sm text-stone-400">
          <p className="font-semibold text-white">Mobile app</p>
          <p className="mt-2">
            Tải app để lưu món yêu thích, tìm quán gần bạn và nhận gợi ý cá nhân
            hóa.
          </p>
        </div>
      </div>
    </footer>
  );
}
