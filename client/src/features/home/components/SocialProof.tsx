'use client';

import { useState, useEffect } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';

// Simulated live activity — rotates through realistic messages
const messages = [
  '🔥 {count} người đang xem sản phẩm này',
  '🛒 {count} đơn hàng được đặt hôm nay',
  '📦 {count} sản phẩm vừa được giao',
  '⭐ {count} khách hàng đánh giá 5 sao',
  '💊 {count}+ sản phẩm chính hãng',
];

function getRandomCount() {
  return Math.floor(Math.random() * 50) + 8; // 8-58
}

export function SocialProof() {
  const [msg, setMsg] = useState('');
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const rotate = () => {
      setVisible(false);
      setTimeout(() => {
        const newCount = getRandomCount();
        setCount(newCount);
        setMsg(messages[Math.floor(Math.random() * messages.length)].replace('{count}', String(newCount)));
        setVisible(true);
      }, 500);
    };

    rotate();
    const interval = setInterval(rotate, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`fixed bottom-24 left-6 z-50 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-2.5 text-sm font-medium text-gray-700 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
      <ShoppingBag className="w-4 h-4 text-teal-600 shrink-0" />
      <span className="whitespace-nowrap">{msg}</span>
    </div>
  );
}
