import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export function useCurrency() {
    const settings = useLiveQuery(() => db.settings.toArray()) || [];

    const currency = settings.find(s => s.key === 'currency')?.value || 'MT';
    const rate = settings.find(s => s.key === 'rate')?.value || 1;

    const formatMoney = (val: number) => {
        const converted = val * rate;
        return `${currency} ${converted.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return { currency, rate, formatMoney };
}
