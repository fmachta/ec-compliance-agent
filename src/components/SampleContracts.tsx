import { useCallback } from 'react';

import contract1 from '../../mock-data/contract-1-dual-use.txt?raw';
import contract2 from '../../mock-data/contract-2-encryption.txt?raw';
import contract3 from '../../mock-data/contract-3-defense.txt?raw';
import contract4 from '../../mock-data/contract-4-clean.txt?raw';
import contract5 from '../../mock-data/contract-5-deemed-export.txt?raw';
import contract6 from '../../mock-data/contract-6-aerospace-mro.txt?raw';

interface ContractInfo {
  id: string;
  label: string;
  icon: string;
  text: string;
}

const CONTRACTS: ContractInfo[] = [
  { id: 'contract-1', label: 'Dual-Use FPGA Export', icon: '🔴', text: contract1 },
  { id: 'contract-2', label: 'Encryption Software', icon: '🟠', text: contract2 },
  { id: 'contract-3', label: 'Defense Article Re-export', icon: '🔴', text: contract3 },
  { id: 'contract-4', label: 'Commercial Furniture (Clean)', icon: '🟢', text: contract4 },
  { id: 'contract-5', label: 'Deemed Export Contractor', icon: '🟡', text: contract5 },
  { id: 'contract-6', label: 'Aerospace MRO Agreement', icon: '🔴', text: contract6 },
];

interface Props {
  onSelect: (file: File) => void;
}

export default function SampleContracts({ onSelect }: Props) {
  const handleSelect = useCallback(
    (contract: ContractInfo) => {
      const blob = new Blob([contract.text], { type: 'application/pdf' });
      const file = new File([blob], `${contract.id}.pdf`, { type: 'application/pdf' });
      onSelect(file);
    },
    [onSelect],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, contract: ContractInfo) => {
      const blob = new Blob([contract.text], { type: 'application/pdf' });
      const file = new File([blob], `${contract.id}.pdf`, { type: 'application/pdf' });
      e.dataTransfer.items.add(file);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {CONTRACTS.map((c) => (
        <div
          key={c.id}
          draggable
          onDragStart={(e) => handleDragStart(e, c)}
          onClick={() => handleSelect(c)}
          className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform select-none"
          title={c.label}
        >
          <div className="text-5xl">📄</div>
          <span className="text-[11px] text-muted-foreground text-center leading-tight max-w-[100px]">
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}
