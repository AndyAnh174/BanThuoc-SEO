'use client';

import Image from 'next/image';

const partners = [
  { name: 'DHG', src: '/cac-doi-tac/DHG .png' },
  { name: 'Hoa Linh', src: '/cac-doi-tac/Hoa-Linh.png' },
  { name: 'Imex', src: '/cac-doi-tac/Imex.png' },
  { name: 'Meracine', src: '/cac-doi-tac/Meracine.png' },
  { name: 'Merap', src: '/cac-doi-tac/Merap.png' },
  { name: 'OPC', src: '/cac-doi-tac/OPC.png' },
  { name: 'Pharmedic', src: '/cac-doi-tac/Pharmedic.png' },
  { name: 'Stella', src: '/cac-doi-tac/Stella.png' },
  { name: 'Trà Vinh Pharm', src: '/cac-doi-tac/Tra-Vinh-Pharm.png' },
  { name: 'Boston', src: '/cac-doi-tac/boston.png' },
];

export function PartnerLogos() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
          Đối tác của chúng tôi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {partners.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-300"
            >
              <div className="relative w-full aspect-[3/1]">
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 18vw"
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnerLogos;
