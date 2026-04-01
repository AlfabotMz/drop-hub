import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A1A] border border-default w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-default bg-[#0D0D0D]/50">
                    <h3 className="font-medium text-green-400 uppercase tracking-widest text-[10px]">{title}</h3>
                    <button onClick={onClose} className="text-[#888780] hover:text-[#F0EFE8] transition-colors"><X size={14} /></button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
