import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Phone, Clock, ShoppingCart, Loader2, Link as LinkIcon } from 'lucide-react';
import { db } from '../db/db';

export default function Leads() {
    const [newPhone, setNewPhone] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const campaigns = useLiveQuery(() => db.campaigns.toArray(), []);
    const leads = useLiveQuery(
        () => db.leads
            .filter(lead => lead.phone.includes(searchTerm))
            .reverse()
            .toArray(),
        [searchTerm]
    );

    const handleAddPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhone.trim()) return;

        setIsSubmitting(true);
        try {
            await db.leads.add({
                phone: newPhone,
                campaignId: selectedCampaign ? parseInt(selectedCampaign) : undefined,
                status: 'NOVO',
                encomendou: false,
                source: 'Adicionado Manualmente',
                createdAt: new Date()
            });
            setNewPhone('');
        } catch (error) {
            console.error('Falha ao adicionar:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePromoteToOrder = async (leadId: number, campaignId?: number) => {
        const nome = prompt('Qual o nome do cliente que encomendou?');
        if (!nome) return;

        try {
            const lead = await db.leads.get(leadId);
            if (lead) {
                await db.leads.update(leadId, { encomendou: true, status: 'CONFIRMADO', name: nome });

                let productId;
                if (campaignId) {
                    const campaign = await db.campaigns.get(campaignId);
                    productId = campaign?.productId;
                }

                await db.orders.add({
                    leadId: leadId,
                    campaignId: campaignId,
                    productId: productId,
                    clientName: nome,
                    clientPhone: lead.phone,
                    total: 0, // Será editado depois ou preenchido conforme produto, mas o ROI calcula sobre Produto.Price
                    status: 'PENDENTE',
                    createdAt: new Date()
                });

                alert('Enviado ao Kanban! O valor total da Encomenda fica atrelado ao Preço de Venda do Produto vinculado à Campanha.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 tracking-tight">Leads & Contatos</h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Base de prospecção e conversão direta</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 overflow-hidden">

                {/* Form e Toolbar */}
                <div className="p-5 border-b border-zinc-800 flex flex-col xl:flex-row gap-4 justify-between items-center bg-zinc-900/50">
                    <form onSubmit={handleAddPhone} className="flex flex-col sm:flex-row w-full xl:w-auto gap-2">
                        <input
                            type="tel"
                            placeholder="Telefone do Lead"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="w-full sm:w-48 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 transition-colors outline-none"
                        />

                        <select
                            value={selectedCampaign}
                            onChange={(e) => setSelectedCampaign(e.target.value)}
                            className="w-full sm:w-48 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 focus:border-red-500 transition-colors outline-none appearance-none"
                        >
                            <option value="">Origem (Sem Campanha)</option>
                            {campaigns?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            disabled={isSubmitting || !newPhone}
                            className="bg-red-600 text-white px-5 py-2 text-xs uppercase font-black hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Registrar'}
                        </button>
                    </form>

                    <div className="relative w-full xl:w-72">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-sm focus:border-red-500 outline-none transition-colors text-zinc-100"
                        />
                    </div>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-950 text-zinc-600 font-bold text-[10px] uppercase tracking-widest border-b border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Contato (Telefone/Nome)</th>
                                <th className="px-6 py-4">Campanha Origem</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Data/Hora</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                            {!leads && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-600">
                                        <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                                        Buscando na base IndexedDB...
                                    </td>
                                </tr>
                            )}
                            {leads?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
                                        Nenhum lead encontrado.
                                    </td>
                                </tr>
                            )}
                            {leads?.map((lead) => {
                                const camp = campaigns?.find(c => c.id === lead.campaignId);

                                return (
                                    <tr key={lead.id} className={`hover:bg-zinc-900/50 transition-colors ${lead.encomendou ? 'opacity-40' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-100 font-bold text-base">
                                                <Phone size={14} className={lead.encomendou ? "text-emerald-500" : "text-zinc-600"} />
                                                {lead.phone} {lead.name && <span className="text-zinc-500 font-medium text-sm ml-2">({lead.name})</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {camp ? (
                                                <span className="flex items-center gap-1.5 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                                    <LinkIcon size={12} className="text-red-500" /> {camp.name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-zinc-700 uppercase font-black tracking-widest">ORGÂNICO</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {lead.encomendou ? (
                                                <span className="bg-emerald-950/30 text-emerald-500 border border-emerald-900/50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                                                    ENCOMENDOU
                                                </span>
                                            ) : (
                                                <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">
                                                    PROSPECT
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-bold tracking-widest uppercase">
                                                <Clock size={12} className="text-zinc-600" />
                                                {new Date(lead.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!lead.encomendou && (
                                                <button
                                                    onClick={() => handlePromoteToOrder(lead.id!, lead.campaignId)}
                                                    className="flex items-center gap-2 bg-zinc-900 text-zinc-300 hover:bg-red-600 hover:text-white hover:border-red-600 border border-zinc-800 px-4 py-2 font-bold uppercase tracking-widest text-[10px] ml-auto transition-colors"
                                                >
                                                    <ShoppingCart size={14} />
                                                    Vender
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
