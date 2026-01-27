"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SuccessModal({ 
    isOpen, 
    onClose, 
    title = "THÀNH CÔNG", 
    message = "Chúc mừng, tài khoản của bạn đã được tạo thành công." 
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Top Green Section with Icon */}
            <div className="bg-[#87D53F] h-40 flex flex-col items-center justify-center pt-4">
                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center mb-2 shadow-sm">
                    <Check className="w-8 h-8 text-white stroke-[4]" />
                </div>
                <h2 className="text-white text-lg font-medium tracking-widest uppercase mt-2">
                    {title}
                </h2>
            </div>

            {/* Bottom Content Section */}
            <div className="px-8 py-8 text-center bg-white">
                <p className="text-gray-500 mb-8 font-medium leading-relaxed">
                    {message}
                </p>
                
                <Button 
                    onClick={onClose}
                    className="w-40 rounded-full bg-[#87D53F] hover:bg-[#76c035] text-white font-medium h-12 shadow-lg shadow-green-200 transition-transform active:scale-95"
                >
                    Tiếp tục
                </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
