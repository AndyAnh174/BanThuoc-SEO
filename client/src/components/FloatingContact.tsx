"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, X, MessageCircle } from "lucide-react";

const HOTLINE = "1800 xxxx";           // ← đổi thành số thật
const ZALO_LINK = "https://zalo.me/0xxxxxxxxx"; // ← đổi thành link Zalo thật

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3">
      {/* Danh sách nút khi mở */}
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Zalo */}
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
        >
          <span className="bg-white text-[#0068ff] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-blue-100">
            Chat Zalo
          </span>
          <div className="w-12 h-12 rounded-full shadow-lg overflow-hidden border-2 border-white hover:scale-110 transition-transform">
            <Image
              src="/Zalo.png"
              alt="Zalo"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
        </a>

        {/* Hotline */}
        <a
          href={`tel:${HOTLINE.replace(/\s/g, "")}`}
          className="group flex items-center gap-2"
        >
          <span className="bg-white text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-green-100">
            {HOTLINE}
          </span>
          <div className="w-12 h-12 rounded-full bg-green-500 shadow-lg flex items-center justify-center border-2 border-white hover:scale-110 hover:bg-green-600 transition-all">
            <Phone className="w-5 h-5 text-white" fill="white" />
          </div>
        </a>
      </div>

      {/* Nút toggle chính */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng liên hệ" : "Liên hệ hỗ trợ"}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-2 border-white transition-all duration-300 ${
          open
            ? "bg-gray-500 hover:bg-gray-600 rotate-0"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" fill="white" />
        )}
      </button>

      {/* Pulse animation khi đóng */}
      {!open && (
        <span className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-green-500 opacity-40 animate-ping pointer-events-none" />
      )}
    </div>
  );
}
