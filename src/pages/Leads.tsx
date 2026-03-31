import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Users, Plus, Phone, ArrowRight, Megaphone } from 'lucide-react';
import { db } from '../db/db';
import ConfirmButton from '../components/ConfirmButton';
import { toast } from 'sonner';
import Modal from '../components/Modal';

export default function Leads() {
    const leads = useLiveQuery(() => db.leads.reverse().toArray()) || [];
    const campaigns = useLiveQuery(() => db.campaigns.toArray()) || [];
    const products = useLiveQuery(() => db.products.toArray()) || [];

    const [formData, setFormData] = useState({ phone: '', name: '', campaignId: '' });

    // Promotion Modal State
    const [promoteModalOpen, setPromoteModalOpen] = useState(false);
    const [promotingLead, setPromotingLead] = useState<any>(null);
    const [promoteData, setPromoteData] = useState({ clientName: '', productId: '' });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.phone) {
            toast.error('Telefone é obrigatório!');
            return;
        }

        await db.leads.add({
            phone: formData.phone,
            name: formData.name || 'Desconhecido',
            campaignId: formData.campaignId ? Number(formData.campaignId) : undefined,
            status: 'NOVO',
            createdAt: new Date(),
            source: 'ORGÂNICO',
            encomendou: false
        });

        toast.success('Lead cadastrado com sucesso!');
        setFormData({ phone: '', name: '', campaignId: '' });
    };

    const handleDelete = async (id: number) => {
        await db.leads.delete(id);
        toast.info('Lead removido da base de dados.');
    };

    const handlePromoteInit = (lead: any) => {
        setPromotingLead(lead);

        // Tentamos deduzir o productId através da campanha, mas deixamos livre para editar
        let autoProductId = '';
        if (lead.campaignId) {
            const camp = campaigns.find(c => c.id === lead.campaignId);
            if (camp && camp.productId) autoProductId = String(camp.productId);
        }

        setPromoteData({ clientName: lead.name === 'Desconhecido' ? '' : lead.name, productId: autoProductId });
        setPromoteModalOpen(true);
    };

    const confirmPromote = async () => {
        if (!promotingLead) return;

        // Criar Order conectada ao Produto e à Campanha (se houver)
        await db.orders.add({
            leadId: promotingLead.id!,
            clientName: promoteData.clientName || 'Cliente Indefinido',
            clientPhone: promotingLead.phone,
            status: 'PENDENTE',
            total: 0, // Fallback visual se não usar produto
            campaignId: promotingLead.campaignId,
            productId: promoteData.productId ? Number(promoteData.productId) : undefined,
            createdAt: new Date()
        });

        // Apagar (consumir) o lead ou arquivar, aqui vamos deletar da base ativa de leads p/ ir pro kanban
        await db.leads.delete(promotingLead.id!);
        toast.success(`Parabéns! Venda de ${promoteData.clientName} enviada ao Kanban!`);

        setPromoteModalOpen(false);
        setPromotingLead(null);
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 flex items-center gap-2 tracking-tight">
                    <Users size={24} className="text-red-500" /> Banco de Leads
                </h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Gerencie os contatos antes da Venda</p>
            </div>

            {/* Promote Modal */}
            <Modal isOpen={promoteModalOpen} onClose={() => setPromoteModalOpen(false)} title="Converter Lead em Venda">
                <div className="space-y-4">
                    <p className="text-xs text-zinc-400">Preencha os dados reais do cliente para gerar a ordem de envio no fluxo de entregas.</p>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Comprador</label>
                        <input
                            type="text"
                            value={promoteData.clientName}
                            onChange={e => setPromoteData({ ...promoteData, clientName: e.target.value })}
                            className="w-full mt-1 p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none"
                            placeholder="Nome Completo"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vincular a Qual Produto?</label>
                        <select
                            value={promoteData.productId}
                            onChange={e => setPromoteData({ ...promoteData, productId: e.target.value })}
                            className="w-full mt-1 p-2.5 bg-zinc-900 border border-zinc-800 text-sm focus:border-red-500 outline-none uppercase font-bold text-zinc-300"
                        >
                            <option value="">-- Ignorar (Sem Produto Real) --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (MT {p.price})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={confirmPromote}
                        className="w-full bg-red-600 text-white font-black py-3 text-xs uppercase tracking-widest hover:bg-red-700 transition"
                    >
                        Criar Pedido de Entrega
                    </button>
                </div>
            </Modal>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Form Card */}
                <div className="lg:col-span-1 bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">Registrar Lead</h3>

                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Campanha de Origem</label>
                            <select
                                value={formData.campaignId}
                                onChange={e => setFormData({ ...formData, campaignId: e.target.value })}
                                className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-xs focus:border-red-500 outline-none uppercase font-bold text-zinc-300"
                            >
                                <option value="">Ordinário (Sem Campanha)</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">WhatsApp / Fone *</label>
                            <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none" required placeholder="Ex: 84000111" />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome Identificado</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none" placeholder="Deixe em branco se anônimo" />
                        </div>

                        <button type="submit" className="w-full mt-4 bg-zinc-100 text-zinc-950 py-3 text-xs uppercase font-black hover:bg-white transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Salvar Lead
                        </button>
                    </form>
                </div>

                {/* List Card */}
                <div className="lg:col-span-3">
                    <div className="bg-zinc-950 border border-zinc-800">
                        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 bg-zinc-900/50 hidden md:grid">
                            <div className="col-span-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Contato</div>
                            <div className="col-span-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Origem</div>
                            <div className="col-span-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Data</div>
                            <div className="col-span-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Ação</div>
                        </div>

                        {(!leads || leads.length === 0) && (
                            <div className="p-12 text-center text-sm font-bold uppercase tracking-widest text-zinc-600">
                                Nenhum lead ativo. Comece a capturar!
                            </div>
                        )}

                        <div className="divide-y divide-zinc-900 overflow-y-auto max-h-[600px]">
                            {leads.map((lead: any) => {
                                const camp = campaigns.find(c => c.id === lead.campaignId);

                                return (
                                    <div key={lead.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 items-start md:items-center hover:bg-zinc-900 transition-colors group">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                                <Phone size={16} className="text-zinc-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-zinc-100">{lead.phone}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase font-black">{lead.name}</p>
                                            </div>
                                        </div>

                                        <div className="col-span-3 flex w-full">
                                            {camp ? (
                                                <span className="text-[9px] px-2 py-1 bg-red-950/30 text-red-500 border border-red-900/50 uppercase font-bold tracking-widest flex items-center gap-1"><Megaphone size={10} /> {camp.name}</span>
                                            ) : (
                                                <span className="text-[9px] px-2 py-1 bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase font-bold tracking-widest">Orgânico</span>
                                            )}
                                        </div>

                                        <div className="col-span-2 text-center w-full md:w-auto text-xs font-medium text-zinc-500">
                                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : '-'}
                                        </div>

                                        <div className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                                            <ConfirmButton onConfirm={() => handleDelete(lead.id!)} className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors" />
                                            <button onClick={() => handlePromoteInit(lead)} className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/30 hover:bg-emerald-600 hover:text-white transition-all text-[10px] uppercase font-black tracking-widest">
                                                Vender <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
