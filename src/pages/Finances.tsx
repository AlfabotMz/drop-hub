import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Wallet, Plus, ArrowUpRight, Activity, Target, Calendar } from 'lucide-react';
import ConfirmButton from '../components/ConfirmButton';
import { toast } from 'sonner';
import { useCurrency } from '../hooks/useCurrency';

export default function Finances() {
    const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7D' | '30D'>('ALL');
    const [formData, setFormData] = useState({
        description: '', amount: '', type: 'ENTRADA'
    });

    const { formatMoney: money } = useCurrency();

    // Filter Logic
    const isWithinFilter = (dateVal: any) => {
        if (dateFilter === 'ALL') return true;
        if (!dateVal) return false;

        const date = new Date(dateVal);
        const now = new Date();
        now.setHours(23, 59, 59, 999);

        if (dateFilter === 'TODAY') {
            return date.toDateString() === now.toDateString();
        }

        const diffDays = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);

        if (dateFilter === '7D') return diffDays <= 7;
        if (dateFilter === '30D') return diffDays <= 30;

        return true;
    };

    let transactions = useLiveQuery(() => db.transactions.reverse().toArray(), []) || [];
    let orders = useLiveQuery(() => db.orders.toArray(), []) || [];
    let products = useLiveQuery(() => db.products.toArray(), []) || [];
    let campaigns = useLiveQuery(() => db.campaigns.toArray(), []) || [];

    // Filter Apply
    transactions = transactions.filter(t => isWithinFilter(t.date));
    orders = orders.filter(o => isWithinFilter(o.createdAt));
    campaigns = campaigns.filter(c => isWithinFilter(c.createdAt));

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        await db.transactions.add({
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type as 'ENTRADA' | 'SAIDA',
            date: new Date()
        });

        toast.success(`Transação salva: ${money(parseFloat(formData.amount))}`);
        setFormData({ ...formData, description: '', amount: '' });
    };

    const handleDelete = async (id: number) => {
        await db.transactions.delete(id);
        toast.info('Lançamento manual removido do livro caixa.');
    };

    // Transações Manuais Locais
    const entradas = transactions.filter(t => t.type === 'ENTRADA').reduce((acc, t) => acc + t.amount, 0);
    const saidas = transactions.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0);
    const caixaManual = entradas - saidas;

    // Cálculo Operacional (Kanban + Campanhas) NO PERIODO
    const deliveredOrders = orders.filter(o => o.status === 'ENTREGUE');
    let opRevenue = 0;
    let opCosts = 0;

    deliveredOrders.forEach(o => {
        const prod = products.find(p => p.id === o.productId);
        if (prod) {
            opRevenue += prod.price;
            opCosts += (prod.cost + prod.deliveryCost);
        } else {
            opRevenue += o.total;
        }
    });

    const adSpends = campaigns.reduce((acc, c) => acc + c.adSpend, 0);
    const lucroOperacional = opRevenue - opCosts - adSpends;

    // Caixa Master Final
    const caixaGlobal = caixaManual + lucroOperacional;

    return (
        <div className="space-y-6">
            <div className="border-b border-default pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-medium uppercase text-[#F0EFE8] flex items-center gap-2 tracking-tight">
                        <Wallet size={24} className="text-green-400" /> Visão de Caixa & Operação
                    </h1>
                    <p className="text-sm text-[#888780] mt-1 uppercase tracking-widest text-[10px] font-medium">Resumo global incluindo resultados do Kanban</p>
                </div>

                <div className="flex items-center gap-2 bg-[#1A1A1A] border border-default px-3 py-1.5 focus-within:border-green-400 transition-colors shrink-0">
                    <Calendar size={14} className="text-green-400" />
                    <select
                        value={dateFilter}
                        onChange={(e: any) => setDateFilter(e.target.value)}
                        className="bg-transparent text-[10px] text-[#E8E6DF] font-medium uppercase tracking-widest outline-none cursor-pointer appearance-none"
                    >
                        <option value="ALL">Todo Período</option>
                        <option value="TODAY">Apenas Hoje</option>
                        <option value="7D">Últimos 7 Dias</option>
                        <option value="30D">Últimos 30 Dias</option>
                    </select>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1A1A1A] border border-default p-6 relative overflow-hidden">
                    <p className="text-[10px] uppercase font-medium text-[#888780] tracking-widest mb-1 flex items-center gap-2"><ArrowUpRight size={14} /> Caixa Fixo ({dateFilter})</p>
                    <h2 className={`text-2xl font-medium tracking-tighter text-[#E8E6DF]`}>
                        {money(caixaManual)}
                    </h2>
                </div>

                <div className="bg-[#1A1A1A] border border-default p-6">
                    <p className="text-[10px] uppercase font-medium text-[#888780] tracking-widest mb-1 flex items-center gap-2">
                        <Activity size={14} className={lucroOperacional >= 0 ? "text-green-400" : "text-green-400"} /> Saldo da Operação ({dateFilter})
                    </p>
                    <h2 className={`text-2xl font-medium tracking-tighter ${lucroOperacional >= 0 ? 'text-green-400' : 'text-green-400'}`}>
                        {lucroOperacional >= 0 ? '+' : ''}{money(lucroOperacional)}
                    </h2>
                </div>

                <div className="bg-[#1A1A1A] border-2 border-green-900/50 p-6 shadow-[inset_0px_0px_60px_rgba(220,38,38,0.05)]">
                    <p className="text-[10px] uppercase font-medium text-green-400 tracking-widest mb-1 flex items-center gap-2">
                        <Target size={14} className="text-green-400" /> Saldo Líquido Desse Período
                    </p>
                    <h2 className={`text-4xl font-medium tracking-tighter ${caixaGlobal >= 0 ? 'text-[#F0EFE8]' : 'text-green-400'}`}>
                        {money(caixaGlobal)}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Add Transaction */}
                <div className="xl:col-span-4 bg-[#1A1A1A] border border-default p-6 flex flex-col gap-4 sticky top-24 h-max">
                    <h3 className="text-xs font-medium text-[#888780] uppercase tracking-widest mb-2 border-b border-default pb-2">Registrar Transação Manual</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-[#888780] uppercase tracking-widest">Descrição</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 bg-[#0D0D0D] border border-default text-sm text-[#F0EFE8] focus:border-green-400 outline-none transition-colors" placeholder="Ex: Pagamento Fornecedor" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-[#888780] uppercase tracking-widest">Valor (MT)</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-2.5 bg-[#0D0D0D] border border-default text-sm text-[#F0EFE8] focus:border-green-400 outline-none transition-colors" placeholder="Ex: 5000" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-[#888780] uppercase tracking-widest">Tipo</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'ENTRADA' })} className={`p-2.5 text-xs font-medium uppercase tracking-widest border transition-colors ${formData.type === 'ENTRADA' ? 'bg-green-400/10 text-green-400 border-emerald-600' : 'bg-[#0D0D0D] text-[#888780] border-default hover:border-default'}`}>
                                    Entrada
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'SAIDA' })} className={`p-2.5 text-xs font-medium uppercase tracking-widest border transition-colors ${formData.type === 'SAIDA' ? 'bg-green-400/10 text-green-400 border-green-400' : 'bg-[#0D0D0D] text-[#888780] border-default hover:border-default'}`}>
                                    Saída
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-4 bg-green-400 text-white py-3 text-xs uppercase font-medium hover:bg-white transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Confirmar Lançamento
                        </button>
                    </form>
                </div>

                {/* Ledger */}
                <div className="xl:col-span-8">
                    <div className="bg-[#1A1A1A] border border-default">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-default bg-[#0D0D0D]/50">
                            <div className="col-span-2 text-[10px] font-medium text-[#888780] uppercase tracking-widest">Data</div>
                            <div className="col-span-4 lg:col-span-5 text-[10px] font-medium text-[#888780] uppercase tracking-widest">Registro Manual</div>
                            <div className="col-span-3 lg:col-span-2 text-[10px] font-medium text-[#888780] uppercase tracking-widest text-center">Tipo</div>
                            <div className="col-span-2 text-[10px] font-medium text-[#888780] uppercase tracking-widest text-right">Valor</div>
                            <div className="col-span-1"></div>
                        </div>

                        {(!transactions || transactions.length === 0) && (
                            <div className="p-12 text-center text-sm font-medium uppercase tracking-widest text-[#636058]">
                                Nenhum lançamento neste período.
                            </div>
                        )}

                        <div className="divide-y divide-default overflow-y-auto max-h-[600px]">
                            {transactions?.map(t => (
                                <div key={t.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#0D0D0D] transition-colors group">
                                    <div className="col-span-2 text-xs text-[#888780] font-medium whitespace-nowrap">
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="col-span-4 lg:col-span-5 text-sm font-medium text-[#E8E6DF] truncate">
                                        {t.description}
                                    </div>
                                    <div className="col-span-3 lg:col-span-2 text-center">
                                        <span className={`text-[9px] lg:text-[10px] px-2 py-1 uppercase font-medium tracking-wider border ${t.type === 'ENTRADA' ? 'text-green-400 border-emerald-900/50 bg-emerald-950/20' : 'text-green-400 border-green-900/50 bg-red-950/20'}`}>
                                            {t.type}
                                        </span>
                                    </div>
                                    <div className={`col-span-2 text-sm font-medium text-right ${t.type === 'ENTRADA' ? 'text-green-400' : 'text-green-400'}`}>
                                        {t.type === 'ENTRADA' ? '+' : '-'}{money(t.amount)}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <ConfirmButton onConfirm={() => handleDelete(t.id!)} className="text-[#636058] hover:text-green-400 transition-colors" iconSize={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
