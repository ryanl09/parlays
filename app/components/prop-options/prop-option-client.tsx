'use client';

import { CreatePropOptionDialog } from "@/app/components/prop-options/create-prop-option-dialog";

interface PropOptionClientProps {
  propId: string;
  propEV: number;
  className?: string;
  onPropOptionAdded?: (newOption: { id: string; line: number; oddsOver: number; oddsUnder: number }) => void;
}

export function PropOptionClient({ propId, propEV, className, onPropOptionAdded }: PropOptionClientProps) {
  return (
    <CreatePropOptionDialog
      className={className}
      propId={propId}
      propEV={propEV}
      onPropOptionAdded={onPropOptionAdded}
    />
  );
} 