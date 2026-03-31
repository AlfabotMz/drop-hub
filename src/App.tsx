import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Orders from './pages/Orders';
import Finances from './pages/Finances';
import Products from './pages/Products';
import Campaigns from './pages/Campaigns';
function App() {
  return (
    <div className="min-h-screen bg-zinc-900">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="leads" element={<Leads />} />
          <Route path="orders" element={<Orders />} />
          <Route path="finances" element={<Finances />} />
          <Route path="*" element={<div className="flex h-full items-center justify-center text-zinc-600 font-bold uppercase tracking-widest text-sm bg-zinc-950 border border-zinc-800 p-10 m-10">Página Indisponível</div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
