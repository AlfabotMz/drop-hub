import Dexie, { type EntityTable } from 'dexie';

export interface Product {
    id?: number;
    name: string;
    price: number;
    cost: number;
    deliveryCost: number;
    createdAt: Date;
}

export interface Campaign {
    id?: number;
    name: string;
    productId: number;
    adSpend: number;
    leadsGenerated: number;
    createdAt: Date;
}

export interface Lead {
    id?: number;
    phone: string;
    name?: string;
    campaignId?: number;
    status: 'NOVO' | 'EM_CONVERSA' | 'CONFIRMADO' | 'REJEITADO';
    source: string;
    encomendou: boolean;
    createdAt: Date;
}

export interface Order {
    id?: number;
    leadId: number;
    campaignId?: number;
    productId?: number;
    clientName: string;
    clientPhone: string;
    total: number;
    status: 'PENDENTE' | 'AGENDADA' | 'ENTREGUE';
    address?: string;
    createdAt: Date;
}

export interface Transaction {
    id?: number;
    description: string;
    amount: number;
    type: 'ENTRADA' | 'SAIDA';
    date: Date;
}

const db = new Dexie('WinikeDatabase') as Dexie & {
    products: EntityTable<Product, 'id'>;
    campaigns: EntityTable<Campaign, 'id'>;
    leads: EntityTable<Lead, 'id'>;
    orders: EntityTable<Order, 'id'>;
    transactions: EntityTable<Transaction, 'id'>;
};

// Reiniciando as stores na view completa para a Versão 3
db.version(3).stores({
    products: '++id, name',
    campaigns: '++id, productId, createdAt',
    leads: '++id, phone, campaignId, status, encomendou, createdAt',
    orders: '++id, leadId, campaignId, productId, status, createdAt',
    transactions: '++id, type, date'
}).upgrade(() => {
    // Upgrades do banco relacional
});

export { db };
