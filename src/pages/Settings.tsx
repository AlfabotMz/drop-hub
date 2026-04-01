import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Coins, Save, RefreshCcw, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    const settings = useLiveQuery(() => db.settings.toArray()) || [];

    const [currency, setCurrency] = useState('MT');
    const [rate, setRate] = useState(1);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const curr = settings.find(s => s.key === 'currency');
        const r = settings.find(s => s.key === 'rate');
        if (curr) setCurrency(curr.value);
        if (r) setRate(r.value);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await db.settings.put({ key: 'currency', value: currency });
            await db.settings.put({ key: 'rate', value: Number(rate) });
            toast.success('Configurações salvas com sucesso!');
        } catch (err) {
            toast.error('Erro ao salvar configurações.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-default pb-4">
                <h1 className="text-2xl font-medium text-[#F0EFE8] flex items-center gap-2">
                    <Coins size={24} className="text-green-400" /> Configurações de Mercado
                </h1>
                <p className="text-sm text-[#888780] mt-1 font-medium italic">Personalize a exibição financeira do seu terminal</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Currency Section */}
                <div className="card space-y-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                                <DollarSign size={18} className="text-green-400" />
                            </div>
                            <h3 className="text-sm font-medium text-[#F0EFE8] uppercase tracking-widest">Moeda Base</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-medium text-[#888780] uppercase tracking-widest block mb-1.5">Símbolo de Exibição (Prefixo)</label>
                                <input
                                    type="text"
                                    value={currency}
                                    onChange={e => setCurrency(e.target.value.toUpperCase())}
                                    className="w-full bg-[#0D0D0D] border border-default p-3 text-[#F0EFE8] focus:border-green-400 outline-none rounded-lg text-sm font-medium"
                                    placeholder="Ex: MT, $, R$, EUR"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-medium text-[#888780] uppercase tracking-widest block mb-1.5">Taxa de Conversão Interna</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={rate}
                                        onChange={e => setRate(Number(e.target.value))}
                                        className="w-full bg-[#0D0D0D] border border-default p-3 text-[#F0EFE8] focus:border-green-400 outline-none rounded-lg text-sm font-medium pl-10"
                                    />
                                    <RefreshCcw size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636058]" />
                                </div>
                                <p className="text-[10px] text-[#636058] mt-2 leading-relaxed">
                                    * Todos os cálculos de faturamento serão multiplicados por esta taxa na visualização do Dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full btn-primary flex items-center justify-center gap-2 mt-4 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        <Save size={14} /> {saving ? 'Salvando...' : 'Aplicar Alterações'}
                    </button>
                </div>

                {/* Info Card */}
                <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-400/20 flex items-center justify-center mb-4">
                        <Coins size={32} className="text-green-400" />
                    </div>
                    <h4 className="text-lg font-medium text-green-100 mb-2">Regionalização de Dados</h4>
                    <p className="text-xs text-green-200/60 leading-relaxed max-w-xs">
                        Defina como o DropHub calcula e exibe seus lucros. Esta configuração afeta todas as telas que exibem valores monetários.
                    </p>
                </div>
            </div>
        </div>
    );
}
