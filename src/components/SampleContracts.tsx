import { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Raw contract texts bundled at build time
import contract1 from '../../mock-data/contract-1-dual-use.txt?raw';
import contract2 from '../../mock-data/contract-2-encryption.txt?raw';
import contract3 from '../../mock-data/contract-3-defense.txt?raw';
import contract4 from '../../mock-data/contract-4-clean.txt?raw';
import contract5 from '../../mock-data/contract-5-deemed-export.txt?raw';
import contract6 from '../../mock-data/contract-6-aerospace-mro.txt?raw';

interface ContractInfo {
  id: string;
  name: string;
  description: string;
  text: string;
  severity: 'critical' | 'high' | 'medium' | 'clean';
}

const CONTRACTS: ContractInfo[] = [
  {
    id: 'contract-1',
    name: 'Dual-Use FPGA Export',
    description: 'FPGA boards to restricted destination — no license, missing end-use statement',
    text: contract1,
    severity: 'high',
  },
  {
    id: 'contract-2',
    name: 'Encryption Software License',
    description: 'AES-256 crypto suite to Russia — no ECCN 5D002, no CCATS review',
    text: contract2,
    severity: 'high',
  },
  {
    id: 'contract-3',
    name: 'Defense Article Re-export',
    description: 'Night-vision components to UAE military — no DSP-5, no ITAR disclosure',
    text: contract3,
    severity: 'critical',
  },
  {
    id: 'contract-4',
    name: 'Commercial Office Furniture',
    description: 'Office furniture to Canada — EAR99, fully compliant with all screening',
    text: contract4,
    severity: 'clean',
  },
  {
    id: 'contract-5',
    name: 'Deemed Export Contractor',
    description: 'Foreign national accessing controlled tech — no TCP, no deemed export acknowledgment',
    text: contract5,
    severity: 'medium',
  },
  {
    id: 'contract-6',
    name: 'Aerospace MRO Agreement',
    description: 'Turbine parts to Bahrain — BIS standard clauses, license required but not cited',
    text: contract6,
    severity: 'critical',
  },
];

const SEVERITY_COLORS = {
  critical: 'border-red-500/50 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10',
  high: 'border-orange-500/50 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10',
  medium: 'border-yellow-500/50 hover:border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10',
  clean: 'border-emerald-500/50 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10',
};

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
      
      // Store the file in dataTransfer so the dropzone can access it
      e.dataTransfer.setData('application/pdf', '');
      e.dataTransfer.items.add(file);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [],
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
        <span>📋</span> Sample Contracts
        <span className="font-normal text-xs">— drag into the zone above or click to analyze</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CONTRACTS.map((c) => (
          <Card
            key={c.id}
            draggable
            onDragStart={(e) => handleDragStart(e, c)}
            onClick={() => handleSelect(c)}
            className={`cursor-grab active:cursor-grabbing border transition-colors ${SEVERITY_COLORS[c.severity]}`}
          >
            <CardContent className="p-3 flex items-start gap-2">
              <div className="text-lg shrink-0 mt-0.5">📄</div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium truncate">{c.name}</span>
                  {c.severity !== 'clean' && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 shrink-0"
                    >
                      {c.severity.toUpperCase()}
                    </Badge>
                  )}
                  {c.severity === 'clean' && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1 py-0 shrink-0 border-emerald-500/50 text-emerald-500"
                    >
                      CLEAN
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {c.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
