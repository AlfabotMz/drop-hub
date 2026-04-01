import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target, ArrowUpRight, ArrowDownRight, Activity, Wallet, BarChart3, Filter, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../db/db';
import { useCurrency } from '../hooks/useCurrency';

export default function Dashboard() {
    const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7D' | '30D'>('ALL');

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

    let transactions = useLiveQuery(() => db.transactions.toArray()) || [];
    let products = useLiveQuery(() => db.products.toArray()) || [];
    let campaigns = useLiveQuery(() => db.campaigns.toArray()) || [];
    let leads = useLiveQuery(() => db.leads.toArray()) || [];
    let orders = useLiveQuery(() => db.orders.toArray()) || [];

    transactions = transactions.filter(t => isWithinFilter(t.date));
    campaigns = campaigns.filter(c => isWithinFilter(c.createdAt));
    leads = leads.filter(l => isWithinFilter(l.createdAt));
    orders = orders.filter(o => isWithinFilter(o.createdAt));

    const handleExportJSON = () => {
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                periodFilter: dateFilter,
                appName: 'DropHub CRM v1'
            },
            data: { products, campaigns, leads, orders, transactions }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `drophub-backup-${dateFilter}-${new Date().getTime()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Relatório JSON (${dateFilter}) exportado com sucesso!`);
    };

    const convertedOrders = orders.filter(o => o.status === 'ENTREGUE');
    let faturamentoBruto = 0;
    let custosTotais = 0;

    convertedOrders.forEach(o => {
        const prod = products.find(p => p.id === o.productId);
        if (prod) {
            faturamentoBruto += prod.price;
            custosTotais += (prod.cost + prod.deliveryCost);
        } else {
            faturamentoBruto += o.total;
        }
    });

    const adSpendTotal = campaigns.reduce((acc, c) => acc + c.adSpend, 0);
    const lucroLiquidoOperacao = faturamentoBruto - custosTotais - adSpendTotal;

    const caixaManual = transactions.reduce((acc, t) => t.type === 'ENTRADA' ? acc + t.amount : acc - t.amount, 0);
    const caixaGlobal = caixaManual + lucroLiquidoOperacao;

    const totalLeads = leads.length;
    const totalOrders = orders.length;
    const finalDelivered = convertedOrders.length;
    const conversionRate = totalLeads > 0 ? ((finalDelivered / totalLeads) * 100).toFixed(1) : '0';

    const { formatMoney: money } = useCurrency();

    return (
        <div className="space-y-6 md:space-y-8">
            <div className="border-b border-default pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
                <div>
                    <h1 className="text-2xl font-medium text-[#F0EFE8] tracking-tight flex items-center gap-2">
                        <BarChart3 size={24} className="text-green-400" /> Painel Central
                    </h1>
                    <p className="text-[13px] text-[#888780] mt-1 font-medium">Resumo Analítico Global e Retenção</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportJSON}
                        className="hidden md:flex items-center gap-2 btn-primary !bg-[#1A1A1A] !text-[#888780] border-default hover:!text-green-400 hover:!border-green-400"
                        title="Exportar Dados Visíveis para JSON"
                    >
                        <Download size={14} className="text-[#888780] group-hover:text-green-400" /> Exportar
                    </button>

                    <div className="flex items-center gap-2 bg-[#1A1A1A] border border-default rounded-md px-3 py-2 hover:border-green-400 transition-colors">
                        <Calendar size={14} className="text-green-400" />
                        <select
                            value={dateFilter}
                            onChange={(e: any) => setDateFilter(e.target.value)}
                            className="bg-transparent text-[11px] text-[#E8E6DF] font-medium uppercase tracking-widest outline-none cursor-pointer appearance-none"
                        >
                            <option value="ALL">Todo Período</option>
                            <option value="TODAY">Apenas Hoje</option>
                            <option value="7D">Últimos 7 Dias</option>
                            <option value="30D">Últimos 30 Dias</option>
                        </select>
                    </div>

                    <div className="text-right hidden sm:block ml-2 pl-4">
                        <p className="text-[11px] uppercase font-medium text-[#888780] tracking-widest mb-0.5 flex items-center gap-1 justify-end"><Wallet size={12} /> Saldo Líquido</p>
                        <h2 className={`text-xl font-medium ${caixaGlobal >= 0 ? 'text-green-400' : 'text-danger'} tracking-tighter`}>{money(caixaGlobal)}</h2>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card relative overflow-hidden group">
                    <p className="text-[11px] font-medium text-[#888780] uppercase tracking-widest mb-2 flex items-center justify-between">
                        Faturamento Global <ArrowUpRight size={14} className="text-green-400" />
                    </p>
                    <h3 className="text-2xl font-medium text-[#F0EFE8] tracking-tighter relative z-10">{money(faturamentoBruto)}</h3>
                </div>

                <div className="card-accent relative overflow-hidden group">
                    <p className="text-[11px] font-medium text-green-200 uppercase tracking-widest mb-2 flex items-center justify-between">
                        Custo Operacional <ArrowDownRight size={14} className="text-green-400" />
                    </p>
                    <h3 className="text-2xl font-medium text-neon-mint tracking-tighter relative z-10">{money(custosTotais + adSpendTotal)}</h3>
                </div>

                <div className="card-dark relative overflow-hidden group">
                    <p className="text-[11px] font-medium text-[#C2EDD8] uppercase tracking-widest mb-2 flex items-center justify-between">
                        Lucro Líquido Real <Activity size={14} className="text-neon-mint" />
                    </p>
                    <h3 className="text-2xl font-medium text-white tracking-tighter relative z-10">{money(lucroLiquidoOperacao)}</h3>
                </div>

                <div className="card relative overflow-hidden group">
                    <p className="text-[11px] font-medium text-[#888780] uppercase tracking-widest mb-2 flex items-center justify-between">
                        Entregas (Check-out) <Target size={14} className="text-[#F0EFE8]" />
                    </p>
                    <h3 className="text-2xl font-medium text-[#F0EFE8] tracking-tighter relative z-10">{finalDelivered}</h3>
                </div>
            </div>

            {/* Funnel Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="col-span-1 lg:col-span-2 card flex flex-col pt-6 px-6 relative overflow-hidden min-h-[350px]">
                    <h3 className="text-[13px] font-medium text-[#E8E6DF] border-b border-default pb-3 flex items-center gap-2">
                        <Filter size={16} className="text-green-400" /> Retenção Magnética do Funil <span className="text-[10px] bg-[#2A2A2A] px-2 py-0.5 rounded-sm ml-2 text-[#888780]">{dateFilter}</span>
                    </h3>

                    <div className="flex-1 w-full py-8 flex flex-col items-center justify-center relative z-10">
                        {/* Vertical Triangle Funnel Container */}
                        <div className="relative w-full max-w-[320px] flex flex-col items-center gap-1">

                            {/* Nivel 1: Leads (Top Wide) */}
                            <div
                                className="relative h-14 bg-gradient-to-b from-[#3a1c71] to-[#4a148c] border-t border-white/10 flex items-center justify-center transition-all duration-700 shadow-[0_0_15px_rgba(147,51,234,0.15)]"
                                style={{ width: '100%', clipPath: 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)' }}
                            >
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">LEADS</p>
                                    <p className="text-xs font-bold text-white leading-none">{totalLeads}</p>
                                </div>
                            </div>

                            {/* Nivel 2: Processing (Kanban) */}
                            <div
                                className="relative h-14 bg-gradient-to-b from-[#4a148c] to-[#311b92] flex items-center justify-center transition-all duration-700 opacity-90"
                                style={{ width: '90%', clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)' }}
                            >
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-white/80 uppercase tracking-tighter">PROCESSING</p>
                                    <p className="text-xs font-bold text-white leading-none">{totalOrders}</p>
                                </div>
                            </div>

                            {/* Nivel 3: Routing (Agendadas) */}
                            <div
                                className="relative h-14 bg-gradient-to-b from-[#311b92] to-[#1e3a8a] flex items-center justify-center transition-all duration-700 opacity-85"
                                style={{ width: '85%', clipPath: 'polygon(0% 0%, 100% 0%, 75% 100%, 25% 100%)' }}
                            >
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-white/70 uppercase tracking-tighter">DELIVERING</p>
                                    <p className="text-xs font-bold text-white leading-none">{orders.filter(o => o.status === 'AGENDADA').length}</p>
                                </div>
                            </div>

                            {/* Nivel 4: Final (Success) */}
                            <div
                                className="relative h-14 bg-gradient-to-b from-[#1e3a8a] to-green-900 flex items-center justify-center transition-all duration-700 shadow-[0_4px_20px_rgba(34,197,94,0.1)]"
                                style={{ width: '75%', clipPath: 'polygon(0% 0%, 100% 0%, 60% 100%, 40% 100%)' }}
                            >
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">CLOSED DEALS</p>
                                    <p className="text-xs font-bold text-white leading-none">{finalDelivered}</p>
                                </div>
                            </div>

                            {/* Final Circle Node (The $ icon from reference) */}
                            <div className="relative -mt-2 z-20">
                                <div className="p-1 rounded-full bg-green-400 shadow-[0_0_20px_#2EBB74] border-2 border-[#1A1A1A]">
                                    <div className="w-10 h-10 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 font-bold border border-green-400/50">
                                        <Wallet size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score panel */}
                <div className="card p-6 flex flex-col">
                    <h3 className="text-[13px] font-medium text-[#E8E6DF] mb-6 border-b border-default pb-3 flex items-center gap-2">
                        Indicador de Win Rate
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[11px] text-[#888780] font-medium uppercase tracking-widest">Conversão Sucesso</span>
                                <span className="text-white font-medium text-2xl">{conversionRate}%</span>
                            </div>
                            <div className="w-full bg-[#0D0D0D] h-2 overflow-hidden rounded-full">
                                <div className="bg-green-400 h-full transition-all duration-1000 shadow-[0_0_8px_#2EBB74]" style={{ width: `${Math.min(100, parseFloat(conversionRate))}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[#0D0D0D] border border-default rounded-lg p-4 text-center">
                                <p className="text-[10px] uppercase font-medium text-[#888780] tracking-widest mb-1.5">Tráfego (Camps)</p>
                                <p className="text-xl font-medium text-[#E8E6DF]">{campaigns.length}</p>
                            </div>
                            <div className="bg-[#0D0D0D] border border-default rounded-lg p-4 text-center">
                                <p className="text-[10px] uppercase font-medium text-[#888780] tracking-widest mb-1.5">Novos Contatos</p>
                                <p className="text-xl font-medium text-[#E8E6DF]">{leads.length}</p>
                            </div>
                        </div>

                        <div className="pt-5 border-t border-default mt-auto">
                            <p className="text-[11px] text-[#888780] text-center font-medium leading-relaxed">
                                Lógica do Motor IDB baseada <br />dinamicamente no Filtro ({dateFilter}).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
