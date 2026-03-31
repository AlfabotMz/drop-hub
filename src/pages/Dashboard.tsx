import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Target, ArrowUpRight, ArrowDownRight, Activity, Wallet, LayoutDashboard, Filter, Calendar } from 'lucide-react';
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { db } from '../db/db';

export default function Dashboard() {
    const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7D' | '30D'>('ALL');

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

    // DB Queries
    let transactions = useLiveQuery(() => db.transactions.toArray()) || [];
    let products = useLiveQuery(() => db.products.toArray()) || [];
    let campaigns = useLiveQuery(() => db.campaigns.toArray()) || [];
    let leads = useLiveQuery(() => db.leads.toArray()) || [];
    let orders = useLiveQuery(() => db.orders.toArray()) || [];

    // Apply Filters to Arrays (Extremely fast since arrays are localized memory)
    transactions = transactions.filter(t => isWithinFilter(t.date));
    campaigns = campaigns.filter(c => isWithinFilter(c.createdAt));
    leads = leads.filter(l => isWithinFilter(l.createdAt));
    orders = orders.filter(o => isWithinFilter(o.createdAt));

    // Finance/Op Math
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

    // Funnel Math & Chart Data
    const totalLeads = leads.length;
    const totalOrders = orders.length;
    const finalDelivered = convertedOrders.length;
    const conversionRate = totalLeads > 0 ? ((finalDelivered / totalLeads) * 100).toFixed(1) : '0';

    const funnelData = [
        { name: 'Prospects (Leads)', value: totalLeads || 0, fill: '#18181b' }, // zinc-900 border
        { name: 'Engajamento (Kanban)', value: totalOrders || 0, fill: '#7f1d1d' }, // red-900
        { name: 'Conversão (Venda)', value: finalDelivered || 0, fill: '#064e3b' } // emerald-900
    ];

    const money = (val: number) => `MT ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase text-zinc-100 tracking-tight flex items-center gap-2">
                        <LayoutDashboard size={24} className="text-red-600" /> Painel Central
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Resumo Analítico Global</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Time Filter Dropdown */}
                    <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 focus-within:border-red-500 transition-colors">
                        <Calendar size={14} className="text-red-500" />
                        <select
                            value={dateFilter}
                            onChange={(e: any) => setDateFilter(e.target.value)}
                            className="bg-transparent text-[10px] text-zinc-300 font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none"
                        >
                            <option value="ALL">Todo Período</option>
                            <option value="TODAY">Apenas Hoje</option>
                            <option value="7D">Últimos 7 Dias</option>
                            <option value="30D">Últimos 30 Dias</option>
                        </select>
                    </div>

                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-1 justify-end"><Wallet size={12} /> Caixa Real</p>
                        <h2 className={`text-xl font-black ${caixaGlobal >= 0 ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>{money(caixaGlobal)}</h2>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/10 to-transparent -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Faturamento Global <ArrowUpRight size={14} className="text-indigo-500" />
                    </p>
                    <h3 className="text-2xl font-black text-indigo-500 tracking-tighter relative z-10">{money(faturamentoBruto)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Custo Operacional Total <ArrowDownRight size={14} className="text-red-500" />
                    </p>
                    <h3 className="text-2xl font-black text-red-500 tracking-tighter relative z-10">{money(custosTotais + adSpendTotal)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Lucro Líquido Real <Activity size={14} className="text-emerald-500" />
                    </p>
                    <h3 className="text-2xl font-black text-emerald-500 tracking-tighter relative z-10">{money(lucroLiquidoOperacao)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-zinc-500/10 to-transparent -mr-4 -mt-4 rotate-12 transition-transform group-hover:scale-110"></div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Entregas Concluídas <Target size={14} className="text-zinc-400" />
                    </p>
                    <h3 className="text-2xl font-black text-zinc-100 tracking-tighter relative z-10">{finalDelivered}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Gráfico de Funil (MODERNO C/ RECHARTS) */}
                <div className="col-span-1 lg:col-span-2 bg-zinc-950 border border-zinc-800 flex flex-col pt-6 px-6">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2 flex items-center gap-2">
                        <Filter size={14} className="text-red-500" /> Retenção do Funil (Data: {dateFilter})
                    </h3>

                    <div className="flex-1 w-full h-[300px] py-4">
                        {totalLeads > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <FunnelChart>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: 0, textTransform: 'uppercase', fontSize: '10px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#ef4444' }}
                                    />
                                    <Funnel
                                        dataKey="value"
                                        data={funnelData}
                                        isAnimationActive
                                    >
                                        <LabelList position="right" fill="#a1a1aa" stroke="none" dataKey="name" fontSize={10} fontWeight="bold" />
                                        {
                                            funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill === '#18181b' ? '#3f3f46' : 'transparent'} strokeWidth={1} />
                                            ))
                                        }
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest">
                                Nenhum lead no período selecionado
                            </div>
                        )}
                    </div>
                </div>

                {/* Indicadores Right */}
                <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex items-center gap-2">
                        Taxa de Win Rate
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Média de Sucesso</span>
                                <span className="text-zinc-100 font-black text-lg">{conversionRate}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 overflow-hidden shadow-[inset_0_0_5px_#000]">
                                <div className="bg-gradient-to-r from-red-900 to-red-500 h-full transition-all duration-1000 shadow-[0_0_10px_#dc2626]" style={{ width: `${Math.min(100, parseFloat(conversionRate))}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 p-3 text-center">
                                <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Campanhas</p>
                                <p className="text-xl font-black text-zinc-300">{campaigns.length}</p>
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 p-3 text-center">
                                <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Leads</p>
                                <p className="text-xl font-black text-zinc-300">{leads.length}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800 mt-auto">
                            <p className="text-[9px] text-zinc-600 text-center font-bold uppercase tracking-widest leading-relaxed">
                                Lógica estritamente temporal do IDB baseada no filtro ({dateFilter}).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
