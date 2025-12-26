import React from 'react';
import { Utensils, Car, ShoppingBag, FileText, Film, Circle } from '@tamagui/lucide-icons';
import { LucideIcon } from '@tamagui/lucide-icons';

const categoryIcons: Record<string, LucideIcon> = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Bills: FileText,
  Entertainment: Film,
  Other: Circle,
};

interface CategoryIconProps {
  category: string;
  size?: number;
  color?: string;
}

export default function CategoryIcon({ category, size = 24, color }: CategoryIconProps) {
  const Icon = categoryIcons[category] || Circle;
  return <Icon size={size} color={color} />;
}

