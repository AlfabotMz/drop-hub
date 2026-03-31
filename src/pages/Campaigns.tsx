import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Megaphone, Plus, Target, DollarSign, Activity } from 'lucide-react';
import ConfirmButton from '../components/ConfirmButton';
import { toast } from 'sonner';

export default function Campaigns() {
    const [formData, setFormData] = useState({
        name: '', productId: '', adSpend: '', leadsGenerated: ''
    });

    const products = useLiveQuery(() => db.products.toArray(), []);
    const campaigns = useLiveQuery(() => db.campaigns.reverse().toArray(), []);
    const orders = useLiveQuery(() => db.orders.toArray(), []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.productId || !formData.adSpend || !formData.leadsGenerated) return;

        await db.campaigns.add({
            name: formData.name,
            productId: parseInt(formData.productId),
            adSpend: parseFloat(formData.adSpend),
            leadsGenerated: parseInt(formData.leadsGenerated),
            createdAt: new Date()
        });

        toast.success('Campanha tracionada (Ativa)!');
        setFormData({ name: '', productId: '', adSpend: '', leadsGenerated: '' });
    };

    const handleDelete = async (id: number) => {
        await db.campaigns.delete(id);
        toast.info('A campanha foi removida dos registros.');
    };

    const money = (val: number) => `MT ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 flex items-center gap-2 tracking-tight">
                    <Megaphone size={24} className="text-red-500" /> Gestão de Campanhas
                </h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Acompanhamento isolado de ROI por Tráfego</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Form */}
                <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">Lançar Campanha</h3>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Campanha</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: CBO_NATAL_FACEBOOK" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Produto Ofertado</label>
                            <select value={formData.productId} onChange={e => setFormData({ ...formData, productId: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors appearance-none">
                                <option value="" disabled>Selecione um Produto...</option>
                                {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({money(p.price)})</option>)}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Orçamento (MT)</label>
                                <input type="number" value={formData.adSpend} onChange={e => setFormData({ ...formData, adSpend: e.target.value })} className="w-full p-2 bg-red-950/20 border border-red-900/30 text-sm text-red-500 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 5000" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Qtd. Leads Recebidos</label>
                                <input type="number" value={formData.leadsGenerated} onChange={e => setFormData({ ...formData, leadsGenerated: e.target.value })} className="w-full p-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 100" />
                            </div>
                        </div>

                        <button type="submit" className="w-full mt-4 bg-white text-zinc-950 py-3 text-xs uppercase font-black hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Ativar Campanha
                        </button>
                    </form>
                </div>

                {/* Relatórios de Campanha */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {(!campaigns || campaigns.length === 0) && (
                        <div className="bg-zinc-950 border border-zinc-800 border-dashed p-12 flex flex-col items-center justify-center text-zinc-600">
                            <Activity size={48} className="mb-4 opacity-50 text-red-900" />
                            <p className="font-bold text-sm uppercase tracking-widest">Zero Campanhas Ativas</p>
                        </div>
                    )}

                    {campaigns?.map(c => {
                        const product = products?.find(p => p.id === c.productId);
                        const campaignOrders = orders?.filter(o => o.campaignId === c.id) || [];
                        const salesCount = campaignOrders.length;

                        const grossRevenue = campaignOrders.reduce((sum, o) => sum + o.total, 0);

                        const totalProductCost = product ? (salesCount * product.cost) : 0;
                        const totalDeliveryCost = product ? (salesCount * product.deliveryCost) : 0;
                        const netProfit = grossRevenue - totalProductCost - totalDeliveryCost - c.adSpend;
                        const isProfit = netProfit >= 0;

                        const cac = salesCount > 0 ? (c.adSpend / salesCount) : 0;
                        const cpl = c.leadsGenerated > 0 ? (c.adSpend / c.leadsGenerated) : 0;
                        const conversionRate = c.leadsGenerated > 0 ? ((salesCount / c.leadsGenerated) * 100) : 0;

                        return (
                            <div key={c.id} className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col group relative overflow-hidden transition-colors hover:border-zinc-700">
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ConfirmButton onConfirm={() => handleDelete(c.id!)} className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors" />
                                </div>

                                <div className="flex justify-between items-start mb-4 border-b border-zinc-900 pb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">{c.name}</h3>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                                            Produto Ofertado: <span className="text-red-500 font-bold">{product?.name || 'Deletado'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Investimento</p>
                                            <p className="text-sm font-bold text-red-500">{money(c.adSpend)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Conversões */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-zinc-900 p-3 border border-zinc-800 text-center">
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Leads Base</p>
                                        <p className="text-xl font-black text-zinc-300">{c.leadsGenerated}</p>
                                    </div>
                                    <div className="bg-zinc-900 p-3 border border-zinc-800 text-center relative overflow-hidden">
                                        <div className="absolute inset-0 border-b-2 border-red-600 opacity-50"></div>
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider relative z-10">Vendas (No Kanban)</p>
                                        <p className="text-xl font-black text-white relative z-10">{salesCount}</p>
                                    </div>
                                    <div className="bg-zinc-900 p-3 border border-zinc-800 text-center">
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Custo p/ Lead (CPL)</p>
                                        <p className="text-sm font-bold text-zinc-400 mt-1">{money(cpl)}</p>
                                    </div>
                                    <div className="bg-zinc-900 p-3 border border-zinc-800 text-center">
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Custo p/ Venda (CAC)</p>
                                        <p className="text-sm font-bold text-zinc-400 mt-1">{money(cac)}</p>
                                    </div>
                                </div>

                                {/* Finanças da Campanha */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 bg-zinc-900 p-4 border border-zinc-800">
                                        <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2 flex items-center gap-2"><Target size={12} /> Taxa de Conversão Real</p>
                                        <div className="flex justify-between items-end">
                                            <h4 className="text-2xl font-black text-zinc-100">{conversionRate.toFixed(1)}%</h4>
                                            <p className="text-[10px] text-zinc-600 uppercase font-bold">Faturamento Bruto: <span className="text-zinc-300">{money(grossRevenue)}</span></p>
                                        </div>
                                    </div>

                                    <div className={`flex-1 p-4 border flex flex-col justify-center ${isProfit ? 'bg-[#0f1f14] border-[#163321]' : 'bg-[#1a0f0f] border-red-900/30'}`}>
                                        <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isProfit ? 'Lucro Líquido Específico' : 'Prejuízo Específico'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={20} className={isProfit ? 'text-emerald-500' : 'text-red-500'} />
                                            <h3 className={`text-3xl font-black ${isProfit ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>
                                                {money(netProfit)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
