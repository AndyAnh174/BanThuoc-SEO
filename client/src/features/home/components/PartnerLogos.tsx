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

const hexColors = [
  'from-amber-50 to-orange-100',
  'from-sky-50 to-blue-100',
  'from-teal-50 to-emerald-100',
  'from-pink-50 to-rose-100',
  'from-violet-50 to-purple-100',
  'from-green-50 to-lime-100',
  'from-cyan-50 to-teal-100',
  'from-yellow-50 to-amber-100',
  'from-red-50 to-orange-100',
  'from-indigo-50 to-blue-100',
];

export function PartnerLogos() {
  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
          Đối tác của chúng tôi
        </h2>

        {/* Honeycomb grid — centered, staggered */}
        <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
          {partners.map((p, idx) => (
            <div
              key={p.name}
              className={`
                relative w-[100px] h-[115px] sm:w-[120px] sm:h-[138px] md:w-[140px] md:h-[162px]
                flex items-center justify-center
                bg-gradient-to-b ${hexColors[idx % hexColors.length]}
                shadow-sm hover:shadow-lg hover:scale-105
                transition-all duration-300 cursor-default
              `}
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            >
              <div className="w-[55%] h-[45%] relative">
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="100px"
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Partner names below */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 max-w-3xl mx-auto">
          {partners.map((p) => (
            <span key={p.name} className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PartnerLogos;
