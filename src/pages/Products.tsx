import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Box, Plus, PackageSearch } from 'lucide-react';
import ConfirmButton from '../components/ConfirmButton';
import { toast } from 'sonner';

export default function Products() {
    const [formData, setFormData] = useState({
        name: '', price: '', cost: '', deliveryCost: ''
    });

    const products = useLiveQuery(() => db.products.reverse().toArray(), []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.cost || !formData.deliveryCost) return;

        await db.products.add({
            name: formData.name,
            price: parseFloat(formData.price),
            cost: parseFloat(formData.cost),
            deliveryCost: parseFloat(formData.deliveryCost),
            createdAt: new Date()
        });
        toast.success('Produto foi adicionado na base!');
        setFormData({ name: '', price: '', cost: '', deliveryCost: '' });
    };

    const handleDelete = async (id: number) => {
        await db.products.delete(id);
        toast.info('Produto arquivado/removido.');
    };

    const money = (val: number) => `MT ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-4">
                <h1 className="text-2xl font-black uppercase text-zinc-100 flex items-center gap-2 tracking-tight">
                    <Box size={24} className="text-red-500" /> Cadastro de Produtos
                </h1>
                <p className="text-sm text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-bold">Base SKU para as Entregas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2">Novo Produto</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Produto</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: Máquina XYZ" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço de Venda (MT)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 1900" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custo Origem (MT)</label>
                            <input type="number" value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 700" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Custo Envio (MT)</label>
                            <input type="number" value={formData.deliveryCost} onChange={e => setFormData({ ...formData, deliveryCost: e.target.value })} className="w-full p-2.5 bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-red-500 outline-none transition-colors" placeholder="Ex: 275" />
                        </div>

                        <button type="submit" className="w-full mt-4 bg-red-600 text-white py-3 text-xs uppercase font-black hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                            <Plus size={16} /> Salvar Produto
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    {(!products || products.length === 0) && (
                        <div className="bg-zinc-950 border border-zinc-800 border-dashed p-12 flex flex-col items-center justify-center text-zinc-600">
                            <PackageSearch size={48} className="mb-4 opacity-50" />
                            <p className="font-bold text-sm uppercase tracking-widest">Inventário Vazio</p>
                        </div>
                    )}

                    {products?.map(p => (
                        <div key={p.id} className="bg-zinc-950 border border-zinc-800 p-5 flex items-start justify-between group hover:border-zinc-700 transition-colors">
                            <div>
                                <h3 className="text-lg font-black text-zinc-100">{p.name}</h3>
                                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mt-1 mb-3">Preço: <span className="text-red-500">{money(p.price)}</span></p>

                                <div className="flex gap-4">
                                    <div className="bg-zinc-900 px-3 py-1.5 border border-zinc-800">
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Custo Prod.</p>
                                        <p className="text-sm font-bold text-zinc-300">{money(p.cost)}</p>
                                    </div>
                                    <div className="bg-zinc-900 px-3 py-1.5 border border-zinc-800">
                                        <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-wider">Custo Entrega</p>
                                        <p className="text-sm font-bold text-zinc-300">{money(p.deliveryCost)}</p>
                                    </div>
                                </div>
                            </div>

                            <ConfirmButton onConfirm={() => handleDelete(p.id!)} className="p-2 border border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-red-500 hover:border-red-500 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
