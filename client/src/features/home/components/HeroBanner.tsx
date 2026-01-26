'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              🏥 Nhà thuốc online uy tín #1
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sức khỏe là vàng,
              <span className="text-primary block">Chăm sóc tận tâm</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Hơn 10.000+ sản phẩm dược phẩm chính hãng, giao hàng nhanh toàn quốc. 
              Đội ngũ dược sĩ tư vấn 24/7.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/products">
                  Mua ngay
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/flash-sale">
                  ⚡ Flash Sale
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">100% Chính hãng</h3>
              <p className="text-sm text-gray-600">
                Cam kết sản phẩm chính hãng, nguồn gốc rõ ràng
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Giao hàng nhanh</h3>
              <p className="text-sm text-gray-600">
                Giao hàng trong 2h với đơn nội thành
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tư vấn 24/7</h3>
              <p className="text-sm text-gray-600">
                Đội ngũ dược sĩ sẵn sàng tư vấn mọi lúc
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-lg text-white">
              <div className="text-3xl font-bold mb-2">10K+</div>
              <p className="text-primary-foreground/90">
                Sản phẩm đa dạng, đầy đủ các danh mục
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;
