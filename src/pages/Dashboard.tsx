import { useLiveQuery } from 'dexie-react-hooks';
import { Target, ArrowUpRight, ArrowDownRight, Activity, Wallet, LayoutDashboard, Filter } from 'lucide-react';
import { db } from '../db/db';

export default function Dashboard() {
    // Queries totais
    const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
    const products = useLiveQuery(() => db.products.toArray()) || [];
    const campaigns = useLiveQuery(() => db.campaigns.toArray()) || [];
    const leads = useLiveQuery(() => db.leads.toArray()) || [];
    const orders = useLiveQuery(() => db.orders.toArray()) || [];

    // Faturamento e Custos Operacionais
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

    // Caixa Master
    const caixaManual = transactions.reduce((acc, t) => t.type === 'ENTRADA' ? acc + t.amount : acc - t.amount, 0);
    const caixaGlobal = caixaManual + lucroLiquidoOperacao;

    // Métricas do Funil
    const totalLeads = leads.length;
    const totalOrders = orders.length; // Encomendas (Pendentes + Agendadas + Entregues)
    const finalDelivered = convertedOrders.length;

    // O funil desce de 100% (Leads) -> % de Orders -> % de Entregues
    const pctOrders = totalLeads > 0 ? (totalOrders / totalLeads) * 100 : 0;
    const pctDelivered = totalLeads > 0 ? (finalDelivered / totalLeads) * 100 : 0;

    const conversionRate = totalLeads > 0 ? ((finalDelivered / totalLeads) * 100).toFixed(1) : '0';

    const money = (val: number) => `MT ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black uppercase text-zinc-100 tracking-tight flex items-center gap-2">
                        <LayoutDashboard size={24} className="text-red-600" /> Painel Central
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Resumo Analítico Global</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-1 justify-end"><Wallet size={12} /> Caixa Real da Empresa</p>
                    <h2 className={`text-xl font-black ${caixaGlobal >= 0 ? 'text-emerald-500' : 'text-red-500'} tracking-tighter`}>{money(caixaGlobal)}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Faturamento Global <ArrowUpRight size={14} className="text-indigo-500" />
                    </p>
                    <h3 className="text-2xl font-black text-indigo-500 tracking-tighter">{money(faturamentoBruto)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Custo Operacional Total <ArrowDownRight size={14} className="text-red-500" />
                    </p>
                    <h3 className="text-2xl font-black text-red-500 tracking-tighter">{money(custosTotais + adSpendTotal)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Lucro Líquido Real <Activity size={14} className="text-emerald-500" />
                    </p>
                    <h3 className="text-2xl font-black text-emerald-500 tracking-tighter">{money(lucroLiquidoOperacao)}</h3>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 p-5 hover:border-zinc-700 transition-colors">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 flex items-center justify-between">
                        Entregas Concluídas <Target size={14} className="text-zinc-400" />
                    </p>
                    <h3 className="text-2xl font-black text-zinc-100 tracking-tighter">{finalDelivered}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Gráfico de Funil */}
                <div className="col-span-1 lg:col-span-2 bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex items-center gap-2">
                        <Filter size={14} className="text-red-500" /> Funil de Vendas (Visão de Retenção)
                    </h3>

                    <div className="flex-1 flex flex-col justify-center items-center gap-2 text-center w-full max-w-lg mx-auto py-8">
                        {/* Camada 1: Leads */}
                        <div className="w-full bg-zinc-800 relative group flex items-center justify-center py-4 transition-all hover:bg-zinc-700 text-zinc-100 font-black">
                            {totalLeads} LEADS TOTAIS (100%)
                        </div>

                        {/* Camada 2: Encomendas */}
                        <div
                            className="bg-red-950 border-x border-red-900/50 relative group flex items-center justify-center py-4 transition-all hover:bg-red-900/50 text-red-500 font-black text-sm"
                            style={{ width: `${Math.max(pctOrders, 20)}%` }} // max 20% pro bloco não sumir
                        >
                            {totalOrders} ENCOMENDAS ({pctOrders.toFixed(1)}%)
                        </div>

                        {/* Camada 3: Finalizados */}
                        <div
                            className="bg-emerald-950 border-x border-emerald-900/50 relative group flex items-center justify-center py-4 transition-all hover:bg-emerald-900/50 text-emerald-500 font-black text-xs"
                            style={{ width: `${Math.max(pctDelivered, 15)}%` }}
                        >
                            {finalDelivered} ENTREGAS ({pctDelivered.toFixed(1)}%)
                        </div>
                    </div>
                </div>

                {/* Indicadores Right */}
                <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-800 pb-2 flex items-center gap-2">
                        Indicadores de Performance
                    </h3>

                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Global Win Rate</span>
                                <span className="text-zinc-100 font-black text-lg">{conversionRate}%</span>
                            </div>
                            <div className="w-full bg-zinc-900 h-2 overflow-hidden">
                                <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${Math.min(100, parseFloat(conversionRate))}%` }}></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900 border border-zinc-800 p-3 text-center">
                                <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Campanhas</p>
                                <p className="text-xl font-black text-zinc-300">{campaigns.length}</p>
                            </div>
                            <div className="bg-zinc-900 border border-zinc-800 p-3 text-center">
                                <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest mb-1">Produtos</p>
                                <p className="text-xl font-black text-zinc-300">{products.length}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-800 mt-auto">
                            <p className="text-[9px] text-zinc-600 text-center font-bold uppercase tracking-widest leading-relaxed">
                                Lógica estritamente baseada no modelo relacional v3 IndexedDB. Todas as somas fluem aqui.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
