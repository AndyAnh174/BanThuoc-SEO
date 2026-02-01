'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, ShieldCheck, Truck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

import Image from 'next/image';

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-primary/5 via-primary/10 to-primary/5">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center mb-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left z-10"
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

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px] hidden lg:block"
          >
             <Image 
                src="/3.png"
                alt="Pharmacy Banner"
                fill
                className="object-contain drop-shadow-2xl"
                priority
             />
          </motion.div>
        </div>

        {/* Features Grid - Moved to bottom */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card className="border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">100% Chính hãng</h3>
                <p className="text-sm text-gray-600">
                  Cam kết sản phẩm chính hãng
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Giao hàng nhanh</h3>
                <p className="text-sm text-gray-600">
                  2h nội thành, 24h toàn quốc
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Tư vấn 24/7</h3>
                <p className="text-sm text-gray-600">
                  Dược sĩ chuyên môn cao
                </p>
              </CardContent>
            </Card>

            <Card className="bg-linear-to-br from-primary to-primary/80 border-none shadow-md text-white">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="text-3xl font-bold mb-1">10K+</div>
                <p className="text-primary-foreground/90 text-sm">
                  Sản phẩm đa dạng
                </p>
              </CardContent>
            </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroBanner;
