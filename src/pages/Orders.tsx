import { useLiveQuery } from 'dexie-react-hooks';
import { Package, Truck, CheckCircle2, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { db } from '../db/db';

export default function Orders() {
    const orders = useLiveQuery(() => db.orders.reverse().toArray());
    const products = useLiveQuery(() => db.products.toArray());
    const campaigns = useLiveQuery(() => db.campaigns.toArray());

    const handleMoveToNextStage = async (orderId: number, currentStatus: string) => {
        let nextStatus = '';
        if (currentStatus === 'PENDENTE') nextStatus = 'AGENDADA';
        else if (currentStatus === 'AGENDADA') nextStatus = 'ENTREGUE';

        if (nextStatus) {
            if (nextStatus === 'AGENDADA') {
                const address = prompt('Endereço / Referência de entrega?');
                await db.orders.update(orderId, { status: nextStatus as any, address: address || 'NÃO INFORMADO' });
            } else {
                await db.orders.update(orderId, { status: nextStatus as any });
            }
        }
    };

    const pendentes = orders?.filter(o => o.status === 'PENDENTE') || [];
    const agendadas = orders?.filter(o => o.status === 'AGENDADA') || [];
    const entregues = orders?.filter(o => o.status === 'ENTREGUE') || [];

    const getRevenueStr = (order: any) => {
        // Obter valor associado
        if (order.productId) {
            const prod = products?.find(p => p.id === order.productId);
            if (prod) return `MT ${prod.price}`;
        }
        return `MT ${order.total}`;
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 tracking-tight">Workflow de Entregas</h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Quadro Kanban Operacional</p>
            </div>

            {!orders && (
                <div className="flex h-64 items-center justify-center text-zinc-500">
                    <Loader2 size={32} className="animate-spin" />
                </div>
            )}

            {orders && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* Coluna Pendentes */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <Package size={16} className="text-zinc-600" />
                            <h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">Pendentes</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{pendentes.length}</span>
                        </div>

                        {pendentes.map(order => {
                            const camp = campaigns?.find(c => c.id === order.campaignId);
                            return (
                                <div key={order.id} className="bg-zinc-900 p-5 border border-zinc-800 hover:border-zinc-700 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">ORD-{order.id}</span>
                                        <span className="text-xs font-black text-white">{getRevenueStr(order)}</span>
                                    </div>
                                    <h4 className="font-bold text-zinc-100 mb-1">{order.clientName}</h4>
                                    <p className="text-xs text-zinc-500 font-medium mb-3">{order.clientPhone}</p>
                                    {camp && <p className="text-[9px] uppercase font-bold text-red-500 tracking-widest mb-4">Campanha: {camp.name}</p>}

                                    <button
                                        onClick={() => handleMoveToNextStage(order.id!, order.status)}
                                        className="w-full flex px-4 py-3 bg-zinc-950 justify-between items-center group-hover:bg-red-600 group-hover:text-white border border-zinc-800 group-hover:border-red-600 transition-colors cursor-pointer text-zinc-400"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">Agendar Entrega</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            )
                        })}
                        {pendentes.length === 0 && <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700 py-4">Vazio</p>}
                    </div>

                    {/* Coluna Agendadas */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <Truck size={16} className="text-blue-500" />
                            <h3 className="font-black text-blue-500 uppercase tracking-widest text-xs">A Caminho</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{agendadas.length}</span>
                        </div>

                        {agendadas.map(order => (
                            <div key={order.id} className="bg-zinc-900 p-5 border border-zinc-800 hover:border-blue-900/50 transition-colors group relative border-l-2 border-l-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">ORD-{order.id}</span>
                                    <span className="text-xs font-black text-white">{getRevenueStr(order)}</span>
                                </div>
                                <h4 className="font-bold text-zinc-100 mb-1">{order.clientName}</h4>

                                <div className="flex items-start gap-1.5 mt-3 mb-4 text-zinc-400 bg-zinc-950 p-3 border border-zinc-800">
                                    <MapPin size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">{order.address}</span>
                                </div>

                                <button
                                    onClick={() => handleMoveToNextStage(order.id!, order.status)}
                                    className="w-full flex px-4 py-3 bg-zinc-950 justify-between items-center group-hover:bg-blue-600 group-hover:text-white border border-zinc-800 group-hover:border-blue-600 transition-colors cursor-pointer text-zinc-400"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest">Validar Entrega</span>
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        ))}
                        {agendadas.length === 0 && <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700 py-4">Vazio</p>}
                    </div>

                    {/* Coluna Entregues */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <h3 className="font-black text-emerald-500 uppercase tracking-widest text-xs">Finalizados</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{entregues.length}</span>
                        </div>

                        {entregues.map(order => (
                            <div key={order.id} className="bg-zinc-900 p-5 border border-zinc-800 opacity-60 hover:opacity-100 transition-opacity border-l-2 border-l-emerald-500">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">ORD-{order.id}</span>
                                    <span className="text-xs font-black text-emerald-500">{getRevenueStr(order)}</span>
                                </div>
                                <h4 className="font-bold text-zinc-300 mb-1">{order.clientName}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{order.clientPhone}</p>
                            </div>
                        ))}
                        {entregues.length === 0 && <p className="text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700 py-4">Vazio</p>}
                    </div>

                </div>
            )}
        </div>
    );
}
