import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';

interface ConfirmButtonProps {
    onConfirm: () => void;
    className?: string;
    iconSize?: number;
}

export default function ConfirmButton({ onConfirm, className = '', iconSize = 16 }: ConfirmButtonProps) {
    const [asking, setAsking] = useState(false);

    if (asking) {
        return (
            <div className="flex items-center gap-1 bg-green-900/50 border border-green-900/50 px-2 flex-wrap">
                <span className="text-[9px] font-medium text-green-400 uppercase tracking-widest">Excluir?</span>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onConfirm(); setAsking(false); }}
                    className="p-1 hover:text-[#F0EFE8] text-green-400 transition-colors"
                >
                    <Check size={12} />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsking(false); }}
                    className="p-1 hover:text-[#F0EFE8] text-[#888780] transition-colors"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAsking(true); }}
            className={className}
        >
            <Trash2 size={iconSize} />
        </button>
    );
}
