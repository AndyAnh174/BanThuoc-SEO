/**
 * Shared category icon mapping — used by Header navbar + CategoryShowcase
 * Map category slug → lucide-react icon component
 */
import {
  Pill, Apple, Stethoscope, Sparkles, Brain, Bone,
  Activity, Droplet, Bath, ShieldBan, BugOff, ScanFace,
  Bandage, Wind, Microscope, FlaskConical, Utensils, LeafyGreen,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  // Root categories (level 0)
  'chăm-sóc-cá-nhân': Bath,
  'dược-mỹ-phẩm': Sparkles,
  'thiết-bị-y-tế': Stethoscope,
  'thuốc': Pill,
  'thực-phẩm-chức-năng': LeafyGreen,
  // Sub-categories (level 1)
  'chống-dị-ứng': ShieldBan,
  'chống-ký-sinh-trùng': BugOff,
  'cơ-xương-khớp': Bone,
  'da-liễu': ScanFace,
  'giảm-đau-kháng-viêm': Bandage,
  'hô-hấp': Wind,
  'kháng-sinh-virus-và-nấm': Microscope,
  'nội-tiết': FlaskConical,
  'thần-kinh': Brain,
  'tim-mạch': Activity,
  'tiêu-hóa': Utensils,
  'tiết-niệu': Droplet,
  'vitamin-và-khoáng-chất': Apple,
};

/** Get the icon component for a category slug. Falls back to Pill. */
export function getCategoryIcon(slug: string): React.ComponentType<{ className?: string }> {
  return CATEGORY_ICONS[slug] || Pill;
}
