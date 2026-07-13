import React from "react";
import { Box, Text, Icon, useNavigate } from "zmp-ui";

const CATS = [
  { name: "Thuoc OTC", icon: "zi-home", subs: ["Giam dau khang viem","Chong di ung","Co xuong khop","Tim mach","Tieu hoa","Ho hap","Than kinh","Noi tiet","Da lieu","Tiet nieu","Chong ky sinh trung"] },
  { name: "Thuc pham chuc nang", icon: "zi-heart", subs: ["Bo nao","Tieu hoa","Mien dich","Xuong khop","Tim mach"] },
  { name: "Vitamin & Khoang chat", icon: "zi-star", subs: ["Vitamin C","Vitamin D","Vitamin E","Vitamin B","Da vitamin","Khoang chat"] },
  { name: "Duoc my pham", icon: "zi-calendar", subs: ["Cham soc da mat","Cham soc co the","Cham soc toc","Khac"] },
  { name: "Thiet bi y te", icon: "zi-location", subs: ["May do","Dung cu","Vat tu y te"] },
  { name: "Me va be", icon: "zi-heart", subs: ["Bau & Sau sinh","Dinh duong be","Cham soc be"] },
  { name: "Combo", icon: "zi-star", subs: ["Combo suc khoe","Combo lam dep","Combo gia dinh"] },
  { name: "Khac", icon: "zi-list-1", subs: ["Cham soc ca nhan","Dung cu"] },
];

export default function CategoryPage() {
  const nav = useNavigate();
  return (
    <Box className="bg-gray-50 min-h-screen">
      <Box className="bg-teal-600 p-4 pt-8 pb-4 rounded-b-2xl">
        <Text.Title className="text-white text-lg">Danh muc san pham</Text.Title>
      </Box>
      <Box className="p-4 space-y-3">
        {CATS.map((cat, i) => (
          <Box key={i} className="bg-white rounded-xl p-4" onClick={() => nav("search")}>
            <Box flex alignItems="center" className="mb-2 space-x-3">
              <Box className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <Icon icon={cat.icon as any} className="text-teal-600" size={20} />
              </Box>
              <Text.Title className="text-base">{cat.name}</Text.Title>
            </Box>
            <Box flex className="flex-wrap gap-1.5 ml-13 pl-1">
              {cat.subs.map((sub, j) => (
                <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{sub}</span>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Box className="h-4" />
    </Box>
  );
}
