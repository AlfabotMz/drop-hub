import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Package, Truck, CheckCircle2, ChevronRight, MapPin, Edit3, X, Save } from 'lucide-react';
import { db } from '../db/db';
import { toast } from 'sonner';
import Modal from '../components/Modal';
import ConfirmButton from '../components/ConfirmButton';

export default function Orders() {
    const orders = useLiveQuery(() => db.orders.reverse().toArray(), []) || [];
    const products = useLiveQuery(() => db.products.toArray(), []) || [];
    const campaigns = useLiveQuery(() => db.campaigns.toArray(), []) || [];

    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [editData, setEditData] = useState({ clientName: '', clientPhone: '', address: '', productId: '' });

    // State for Address Modal when moving pendente -> agendada
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [promotingOrderId, setPromotingOrderId] = useState<number | null>(null);

    const handleMoveToNextStage = async (orderId: number, currentStatus: string) => {
        if (currentStatus === 'PENDENTE') {
            setPromotingOrderId(orderId);
            setAddressInput('');
            setAddressModalOpen(true);
        } else if (currentStatus === 'AGENDADA') {
            await db.orders.update(orderId, { status: 'ENTREGUE' });
            toast.success('Pedido entregue com sucesso!');
        }
    };

    const confirmAddressAndPromote = async () => {
        if (!promotingOrderId) return;
        await db.orders.update(promotingOrderId, {
            status: 'AGENDADA',
            address: addressInput || 'NÃO INFORMADO'
        });
        toast.success('Pedido enviado para rota (Agendado)!');
        setAddressModalOpen(false);
        setPromotingOrderId(null);
    };

    const handleDelete = async (orderId: number) => {
        await db.orders.delete(orderId);
        setEditingOrderId(null);
        toast.info('Encomenda excluída do sistema.');
    };

    const handleEditStart = (order: any) => {
        setEditingOrderId(order.id);
        setEditData({
            clientName: order.clientName || '',
            clientPhone: order.clientPhone || '',
            address: order.address || '',
            productId: String(order.productId || '')
        });
    };

    const handleEditSave = async (orderId: number) => {
        await db.orders.update(orderId, {
            clientName: editData.clientName,
            clientPhone: editData.clientPhone,
            address: editData.address,
            productId: editData.productId ? Number(editData.productId) : undefined
        });
        setEditingOrderId(null);
        toast.success('Dados da encomenda atualizados.');
    };

    const pendentes = orders.filter(o => o.status === 'PENDENTE');
    const agendadas = orders.filter(o => o.status === 'AGENDADA');
    const entregues = orders.filter(o => o.status === 'ENTREGUE');

    const getRevenueStr = (order: any) => {
        if (order.productId) {
            const prod = products.find(p => p.id === order.productId);
            if (prod) return `MT ${prod.price}`;
        }
        return `MT ${order.total}`;
    }

    const OrderCard = ({ order, iconColorClass, enableAddress = false }: { order: any, iconColorClass: string, enableAddress?: boolean }) => {
        const camp = campaigns.find(c => c.id === order.campaignId);
        const isEditing = editingOrderId === order.id;

        return (
            <div className={`bg-zinc-900 border ${isEditing ? 'border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-zinc-800'} hover:border-zinc-700 transition-all group relative ${iconColorClass}`}>

                {/* Actions Top Right */}
                {!isEditing && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={() => handleEditStart(order)} className="p-1.5 text-zinc-500 hover:text-white bg-zinc-950 border border-zinc-800 transition-colors"><Edit3 size={12} /></button>
                        <ConfirmButton onConfirm={() => handleDelete(order.id)} className="p-1.5 text-zinc-500 hover:text-red-500 bg-zinc-950 border border-zinc-800 transition-colors" iconSize={12} />
                    </div>
                )}

                <div className="p-5">
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-2">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Editando ORD-{order.id}</span>
                                <button onClick={() => setEditingOrderId(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                            </div>

                            {/* Product Connection */}
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Vincular Produto</label>
                                <select
                                    value={editData.productId}
                                    onChange={e => setEditData({ ...editData, productId: e.target.value })}
                                    className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs px-2 py-1.5 focus:border-red-500 text-zinc-100 outline-none"
                                >
                                    <option value="">-- Sem Produto (Apenas Valor Genérico) --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (MT {p.price})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Cliente</label>
                                <input type="text" value={editData.clientName} onChange={e => setEditData({ ...editData, clientName: e.target.value })} className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs px-2 py-1.5 focus:border-red-500 text-zinc-100 outline-none" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Telefone</label>
                                <input type="text" value={editData.clientPhone} onChange={e => setEditData({ ...editData, clientPhone: e.target.value })} className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs px-2 py-1.5 focus:border-red-500 text-zinc-100 outline-none" />
                            </div>
                            {enableAddress && (
                                <div>
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Endereço de Entrega</label>
                                    <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} className="w-full mt-1 bg-zinc-950 border border-zinc-800 text-xs px-2 py-1.5 focus:border-red-500 text-zinc-100 outline-none resize-none" rows={2}></textarea>
                                </div>
                            )}
                            <button onClick={() => handleEditSave(order.id)} className="w-full mt-2 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest py-2 hover:bg-red-700 transition flex items-center justify-center gap-2">
                                <Save size={12} /> Salvar Alterações
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-2 pr-12">
                                <span className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase">ORD-{order.id}</span>
                                <span className="text-xs font-black text-emerald-500">{getRevenueStr(order)}</span>
                            </div>
                            <h4 className="font-bold text-zinc-100 mb-1 leading-tight">{order.clientName}</h4>
                            <p className="text-xs text-zinc-500 font-medium mb-3">{order.clientPhone}</p>

                            {enableAddress && order.address && (
                                <div className="flex items-start gap-1.5 mt-3 mb-4 text-zinc-400 bg-zinc-950 p-2.5 border border-zinc-800">
                                    <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wide leading-relaxed">{order.address}</span>
                                </div>
                            )}

                            {order.productId && (
                                <p className="text-[9px] uppercase font-bold text-indigo-500 tracking-widest mt-1">Produto Associado</p>
                            )}
                            {camp && <p className="text-[9px] uppercase font-bold text-red-500 tracking-widest mt-1 border-t border-zinc-800 pt-1">Tráfego: {camp.name}</p>}
                        </>
                    )}
                </div>

                {!isEditing && order.status !== 'ENTREGUE' && (
                    <button
                        onClick={() => handleMoveToNextStage(order.id!, order.status)}
                        className={`w-full flex px-4 py-3 bg-zinc-950 justify-between items-center transition-colors cursor-pointer border-t border-zinc-800
                            ${order.status === 'PENDENTE' ? 'group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 text-zinc-400' : ''}
                            ${order.status === 'AGENDADA' ? 'group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 text-zinc-400' : ''}
                        `}
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {order.status === 'PENDENTE' ? 'Agendar Entrega' : 'Validar Entrega'}
                        </span>
                        <ChevronRight size={14} />
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 tracking-tight">Workflow de Entregas</h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Quadro Kanban Operacional</p>
            </div>

            <Modal
                isOpen={addressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                title="Agendar Entrega"
            >
                <div className="space-y-4">
                    <p className="text-xs text-zinc-400">Informe detalhes da entrega ou endereço (ex: Bairro X, Casa 10).</p>
                    <textarea
                        value={addressInput}
                        onChange={e => setAddressInput(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 p-3 text-sm text-white focus:border-red-500 outline-none resize-none"
                        rows={3}
                        placeholder="Endereço exato..."
                    />
                    <button
                        onClick={confirmAddressAndPromote}
                        className="w-full bg-red-600 text-white font-black py-3 text-xs uppercase tracking-widest hover:bg-red-700 transition"
                    >
                        Confirmar Rota
                    </button>
                </div>
            </Modal>

            {(!orders || orders.length === 0) && (
                <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-600 border border-dashed border-zinc-800 mt-6">
                    Mural Vazio. Nenhuma encomenda no momento.
                </div>
            )}

            {orders && orders.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* Coluna Pendentes */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <Package size={16} className="text-zinc-600" />
                            <h3 className="font-black text-zinc-400 uppercase tracking-widest text-xs">Pendentes</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{pendentes.length}</span>
                        </div>
                        {pendentes.map(order => <OrderCard key={order.id} order={order} iconColorClass="" />)}
                    </div>

                    {/* Coluna Agendadas */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <Truck size={16} className="text-red-500" />
                            <h3 className="font-black text-red-500 uppercase tracking-widest text-xs">A Caminho</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{agendadas.length}</span>
                        </div>
                        {agendadas.map(order => <OrderCard key={order.id} order={order} iconColorClass="border-l-2 border-l-red-500" enableAddress={true} />)}
                    </div>

                    {/* Coluna Entregues */}
                    <div className="flex flex-col gap-4 bg-zinc-950 border border-zinc-900 p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-zinc-900 mb-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            <h3 className="font-black text-emerald-500 uppercase tracking-widest text-xs">Finalizados</h3>
                            <span className="ml-auto bg-zinc-900 text-zinc-500 text-[10px] px-2 py-0.5 font-bold uppercase">{entregues.length}</span>
                        </div>
                        {entregues.map(order => <OrderCard key={order.id} order={order} iconColorClass="border-l-2 border-l-emerald-500" enableAddress={true} />)}
                    </div>

                </div>
            )}
        </div>
    );
}
