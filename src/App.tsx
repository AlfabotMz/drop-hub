import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Orders from './pages/Orders';
import Finances from './pages/Finances';
import Products from './pages/Products';
import Campaigns from './pages/Campaigns';
import SettingsPage from './pages/Settings';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Toaster theme="dark" position="bottom-right" toastOptions={{ className: 'rounded-xl border-default bg-[#1A1A1A] text-[#F0EFE8] font-medium uppercase tracking-widest text-[10px]' }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="leads" element={<Leads />} />
          <Route path="orders" element={<Orders />} />
          <Route path="finances" element={<Finances />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<div className="flex h-full items-center justify-center text-[#636058] font-medium uppercase tracking-widest text-sm bg-[#1A1A1A] border border-default p-10 m-10 rounded-xl">Página Indisponível</div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
