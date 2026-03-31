import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Trash2, Activity, Target } from 'lucide-react';

export default function Finances() {
    const [formData, setFormData] = useState({
        description: '', amount: '', type: 'ENTRADA'
    });

    const transactions = useLiveQuery(() => db.transactions.reverse().toArray(), []);
    const orders = useLiveQuery(() => db.orders.toArray(), []);
    const products = useLiveQuery(() => db.products.toArray(), []);
    const campaigns = useLiveQuery(() => db.campaigns.toArray(), []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        await db.transactions.add({
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type as 'ENTRADA' | 'SAIDA',
            date: new Date()
        });

        setFormData({ ...formData, description: '', amount: '' });
    };

    const handleDelete = async (id: number) => {
        if (confirm('Tem certeza em deletar esta transação?')) {
            await db.transactions.delete(id);
        }
    };

    const money = (val: number) => `MT ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // Transações Manuais
    const entradas = transactions?.filter(t => t.type === 'ENTRADA').reduce((acc, t) => acc + t.amount, 0) || 0;
    const saidas = transactions?.filter(t => t.type === 'SAIDA').reduce((acc, t) => acc + t.amount, 0) || 0;
    const caixaManual = entradas - saidas;

    // Cálculo Operacional (Kanban + Campanhas)
    const deliveredOrders = orders?.filter(o => o.status === 'ENTREGUE') || [];
    let opRevenue = 0;
    let opCosts = 0;

    deliveredOrders.forEach(o => {
        const prod = products?.find(p => p.id === o.productId);
        if (prod) {
            opRevenue += prod.price;
            opCosts += (prod.cost + prod.deliveryCost);
        } else {
            opRevenue += o.total;
        }
    });

    const adSpends = campaigns?.reduce((acc, c) => acc + c.adSpend, 0) || 0;
    const lucroOperacional = opRevenue - opCosts - adSpends;

    // Caixa Master Final
    const caixaGlobal = caixaManual + lucroOperacional;

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 flex items-center gap-2 tracking-tight">
                    <Wallet size={24} className="text-red-500" /> Visão de Caixa & Operação
                </h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Resumo global incluindo resultados do Kanban</p>
            </div>

            {/* Top Cards (Fusão Operacional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-950 border border-zinc-800 p-6 relative overflow-hidden">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 flex items-center gap-2"><ArrowUpRight size={14} /> Caixa Fixo (Manual)</p>
                    <h2 className={`text-2xl font-black tracking-tighter text-zinc-300`}>
                        {money(caixaManual)}
                    </h2>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-6">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 flex items-center gap-2">
                        <Activity size={14} className={lucroOperacional >= 0 ? "text-emerald-500" : "text-red-500"} /> Resultado Operacional (Kanban)
                    </p>
                    <h2 className={`text-2xl font-black tracking-tighter ${lucroOperacional >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {lucroOperacional >= 0 ? '+' : ''}{money(lucroOperacional)}
                    </h2>
                </div>

                <div className="bg-zinc-950 border-2 border-red-900/50 p-6 shadow-[inset_0px_0px_60px_rgba(220,38,38,0.05)]">
                    <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1 flex items-center gap-2">
                        <Target size={14} className="text-red-500" /> Saldo Líquido Final da Empresa
                    </p>
                    <h2 className={`text-4xl font-black tracking-tighter ${caixaGlobal >= 0 ? 'text-white' : 'text-red-500'}`}>
                        {money(caixaGlobal)}
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Add Transaction */}
                <div className="xl:col-span-4 bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-4 sticky top-24 h-max">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">Registrar Transação Manual</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</label>
                            <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: Pagamento Fornecedor" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Valor (MT)</label>
                            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 5000" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tipo</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'ENTRADA' })} className={`p-2.5 text-xs font-bold uppercase tracking-widest border transition-colors ${formData.type === 'ENTRADA' ? 'bg-emerald-600/10 text-emerald-500 border-emerald-600' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>
                                    Entrada
                                </button>
                                <button type="button" onClick={() => setFormData({ ...formData, type: 'SAIDA' })} className={`p-2.5 text-xs font-bold uppercase tracking-widest border transition-colors ${formData.type === 'SAIDA' ? 'bg-red-600/10 text-red-500 border-red-600' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}>
                                    Saída
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-4 bg-zinc-100 text-zinc-950 py-3 text-xs uppercase font-black hover:bg-white transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Confirmar Lançamento
                        </button>
                    </form>
                </div>

                {/* Ledger */}
                <div className="xl:col-span-8">
                    <div className="bg-zinc-950 border border-zinc-800">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50">
                            <div className="col-span-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Data</div>
                            <div className="col-span-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registro Manual</div>
                            <div className="col-span-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Tipo</div>
                            <div className="col-span-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Montante</div>
                            <div className="col-span-1"></div>
                        </div>

                        {(!transactions || transactions.length === 0) && (
                            <div className="p-12 text-center text-sm font-bold uppercase tracking-widest text-zinc-600">
                                Nenhum lançamento manual no sistema.
                            </div>
                        )}

                        <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[600px]">
                            {transactions?.map(t => (
                                <div key={t.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-zinc-900 transition-colors group">
                                    <div className="col-span-2 text-xs text-zinc-500 font-medium">
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div className="col-span-5 text-sm font-bold text-zinc-300">
                                        {t.description}
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <span className={`text-[10px] px-2 py-1 uppercase font-bold tracking-wider border ${t.type === 'ENTRADA' ? 'text-emerald-500 border-emerald-900/50 bg-emerald-950/20' : 'text-red-500 border-red-900/50 bg-red-950/20'}`}>
                                            {t.type}
                                        </span>
                                    </div>
                                    <div className={`col-span-2 text-sm font-black text-right ${t.type === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {t.type === 'ENTRADA' ? '+' : '-'}{money(t.amount)}
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <button onClick={() => handleDelete(t.id!)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
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
