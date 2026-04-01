import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Package, Truck, CheckCircle2, ChevronRight, MapPin, Edit3, X, Save } from 'lucide-react';
import { db } from '../db/db';
import { toast } from 'sonner';
import Modal from '../components/Modal';
import ConfirmButton from '../components/ConfirmButton';
import { useCurrency } from '../hooks/useCurrency';

export default function Orders() {
    const { formatMoney: money } = useCurrency();
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
            if (prod) return money(prod.price);
        }
        return money(order.total);
    }

    const OrderCard = ({ order, iconColorClass, enableAddress = false }: { order: any, iconColorClass: string, enableAddress?: boolean }) => {
        const camp = campaigns.find(c => c.id === order.campaignId);
        const isEditing = editingOrderId === order.id;

        return (
            <div className={`bg-[#0D0D0D] border ${isEditing ? 'border-green-400 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'border-default'} hover:border-default transition-all group relative ${iconColorClass}`}>

                {/* Actions Top Right */}
                {!isEditing && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={() => handleEditStart(order)} className="p-1.5 text-[#888780] hover:text-[#F0EFE8] bg-[#1A1A1A] border border-default transition-colors"><Edit3 size={12} /></button>
                        <ConfirmButton onConfirm={() => handleDelete(order.id)} className="p-1.5 text-[#888780] hover:text-green-400 bg-[#1A1A1A] border border-default transition-colors" iconSize={12} />
                    </div>
                )}

                <div className="p-5">
                    {isEditing ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2 border-b border-default pb-2">
                                <span className="text-[10px] font-medium text-green-400 uppercase tracking-widest">Editando ORD-{order.id}</span>
                                <button onClick={() => setEditingOrderId(null)} className="text-[#888780] hover:text-[#F0EFE8]"><X size={14} /></button>
                            </div>

                            {/* Product Connection */}
                            <div>
                                <label className="text-[9px] font-medium text-[#888780] uppercase tracking-widest">Vincular Produto</label>
                                <select
                                    value={editData.productId}
                                    onChange={e => setEditData({ ...editData, productId: e.target.value })}
                                    className="w-full mt-1 bg-[#1A1A1A] border border-default text-xs px-2 py-1.5 focus:border-green-400 text-[#F0EFE8] outline-none"
                                >
                                    <option value="">-- Sem Produto (Apenas Valor Genérico) --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (MT {p.price})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-medium text-[#888780] uppercase tracking-widest">Nome do Cliente</label>
                                <input type="text" value={editData.clientName} onChange={e => setEditData({ ...editData, clientName: e.target.value })} className="w-full mt-1 bg-[#1A1A1A] border border-default text-xs px-2 py-1.5 focus:border-green-400 text-[#F0EFE8] outline-none" />
                            </div>
                            <div>
                                <label className="text-[9px] font-medium text-[#888780] uppercase tracking-widest">Telefone</label>
                                <input type="text" value={editData.clientPhone} onChange={e => setEditData({ ...editData, clientPhone: e.target.value })} className="w-full mt-1 bg-[#1A1A1A] border border-default text-xs px-2 py-1.5 focus:border-green-400 text-[#F0EFE8] outline-none" />
                            </div>
                            {enableAddress && (
                                <div>
                                    <label className="text-[9px] font-medium text-[#888780] uppercase tracking-widest">Endereço de Entrega</label>
                                    <textarea value={editData.address} onChange={e => setEditData({ ...editData, address: e.target.value })} className="w-full mt-1 bg-[#1A1A1A] border border-default text-xs px-2 py-1.5 focus:border-green-400 text-[#F0EFE8] outline-none resize-none" rows={2}></textarea>
                                </div>
                            )}
                            <button onClick={() => handleEditSave(order.id)} className="w-full mt-2 bg-green-400 text-[#F0EFE8] font-medium text-[10px] uppercase tracking-widest py-2 hover:bg-green-600 transition flex items-center justify-center gap-2">
                                <Save size={12} /> Salvar Alterações
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-2 pr-12">
                                <span className="text-[10px] font-medium text-[#636058] tracking-widest uppercase">ORD-{order.id}</span>
                                <span className="text-xs font-medium text-green-400">{getRevenueStr(order)}</span>
                            </div>
                            <h4 className="font-medium text-[#F0EFE8] mb-1 leading-tight">{order.clientName}</h4>
                            <p className="text-xs text-[#888780] font-medium mb-3">{order.clientPhone}</p>

                            {enableAddress && order.address && (
                                <div className="flex items-start gap-1.5 mt-3 mb-4 text-[#888780] bg-[#1A1A1A] p-2.5 border border-default">
                                    <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-medium uppercase tracking-wide leading-relaxed">{order.address}</span>
                                </div>
                            )}

                            {order.productId && (
                                <p className="text-[9px] uppercase font-medium text-indigo-500 tracking-widest mt-1">Produto Associado</p>
                            )}
                            {camp && <p className="text-[9px] uppercase font-medium text-green-400 tracking-widest mt-1 border-t border-default pt-1">Tráfego: {camp.name}</p>}
                        </>
                    )}
                </div>

                {!isEditing && order.status !== 'ENTREGUE' && (
                    <button
                        onClick={() => handleMoveToNextStage(order.id!, order.status)}
                        className={`w-full flex px-4 py-3 bg-[#1A1A1A] justify-between items-center transition-colors cursor-pointer border-t border-default
                            ${order.status === 'PENDENTE' ? 'group-hover:bg-green-400 group-hover:text-[#F0EFE8] group-hover:border-green-400 text-[#888780]' : ''}
                            ${order.status === 'AGENDADA' ? 'group-hover:bg-emerald-600 group-hover:text-[#F0EFE8] group-hover:border-emerald-600 text-[#888780]' : ''}
                        `}
                    >
                        <span className="text-[10px] font-medium uppercase tracking-widest">
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
            <div className="border-b border-default pb-4">
                <h1 className="text-2xl font-medium uppercase text-[#F0EFE8] tracking-tight">Workflow de Entregas</h1>
                <p className="text-sm text-[#888780] mt-1 uppercase tracking-widest text-[10px] font-medium">Quadro Kanban Operacional</p>
            </div>

            <Modal
                isOpen={addressModalOpen}
                onClose={() => setAddressModalOpen(false)}
                title="Agendar Entrega"
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#888780]">Informe detalhes da entrega ou endereço (ex: Bairro X, Casa 10).</p>
                    <textarea
                        value={addressInput}
                        onChange={e => setAddressInput(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-default p-3 text-sm text-[#F0EFE8] focus:border-green-400 outline-none resize-none"
                        rows={3}
                        placeholder="Endereço exato..."
                    />
                    <button
                        onClick={confirmAddressAndPromote}
                        className="w-full bg-green-400 text-[#F0EFE8] font-medium py-3 text-xs uppercase tracking-widest hover:bg-green-600 transition"
                    >
                        Confirmar Rota
                    </button>
                </div>
            </Modal>

            {(!orders || orders.length === 0) && (
                <div className="p-12 text-center text-[10px] font-medium uppercase tracking-widest text-[#636058] border border-dashed border-default mt-6">
                    Mural Vazio. Nenhuma encomenda no momento.
                </div>
            )}

            {orders && orders.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                    {/* Coluna Pendentes */}
                    <div className="flex flex-col gap-4 bg-[#1A1A1A] border border-default p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-default mb-2">
                            <Package size={16} className="text-[#636058]" />
                            <h3 className="font-medium text-[#888780] uppercase tracking-widest text-xs">Pendentes</h3>
                            <span className="ml-auto bg-[#0D0D0D] text-[#888780] text-[10px] px-2 py-0.5 font-medium uppercase">{pendentes.length}</span>
                        </div>
                        {pendentes.map(order => <OrderCard key={order.id} order={order} iconColorClass="" />)}
                    </div>

                    {/* Coluna Agendadas */}
                    <div className="flex flex-col gap-4 bg-[#1A1A1A] border border-default p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-default mb-2">
                            <Truck size={16} className="text-green-400" />
                            <h3 className="font-medium text-green-400 uppercase tracking-widest text-xs">A Caminho</h3>
                            <span className="ml-auto bg-[#0D0D0D] text-[#888780] text-[10px] px-2 py-0.5 font-medium uppercase">{agendadas.length}</span>
                        </div>
                        {agendadas.map(order => <OrderCard key={order.id} order={order} iconColorClass="border-l-2 border-l-green-400" enableAddress={true} />)}
                    </div>

                    {/* Coluna Entregues */}
                    <div className="flex flex-col gap-4 bg-[#1A1A1A] border border-default p-4 min-h-[500px]">
                        <div className="flex items-center gap-2 pt-1 pb-3 border-b border-default mb-2">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <h3 className="font-medium text-green-400 uppercase tracking-widest text-xs">Finalizados</h3>
                            <span className="ml-auto bg-[#0D0D0D] text-[#888780] text-[10px] px-2 py-0.5 font-medium uppercase">{entregues.length}</span>
                        </div>
                        {entregues.map(order => <OrderCard key={order.id} order={order} iconColorClass="border-l-2 border-l-emerald-500" enableAddress={true} />)}
                    </div>

                </div>
            )}
        </div>
    );
}
