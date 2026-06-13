'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface PopupBanner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const COOKIE_NAME = 'popup_closed';
const COOKIE_DAYS = 1;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/`;
}

export function PopupAd() {
  const [popup, setPopup] = useState<PopupBanner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getCookie(COOKIE_NAME)) return;

    fetch(`${API_URL}/banners/popup/`)
      .then((res) => {
        if (!res.ok) throw new Error('No popup');
        return res.json();
      })
      .then((data) => {
        if (data && data.image_url) {
          setPopup(data);
          setTimeout(() => setVisible(true), 500);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setVisible(false);
    setCookie(COOKIE_NAME, popup?.id || 'closed', COOKIE_DAYS);
  };

  if (!popup || !visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleClose}
    >
      <div
        className="relative max-w-2xl w-[90vw] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Full-width image */}
        {popup.link_url ? (
          <Link href={popup.link_url} onClick={handleClose}>
            <img
              src={popup.image_url}
              alt={popup.title}
              className="w-full h-auto object-cover cursor-pointer"
            />
          </Link>
        ) : (
          <img
            src={popup.image_url}
            alt={popup.title}
            className="w-full h-auto object-cover"
          />
        )}
      </div>
    </div>
  );
}

export default PopupAd;
