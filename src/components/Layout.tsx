import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, Settings, LogOut, Wallet, Megaphone, Box } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, mobile: true },
        { name: 'Produtos', path: '/products', icon: Box, mobile: false },
        { name: 'Campanhas', path: '/campaigns', icon: Megaphone, mobile: true },
        { name: 'Leads', path: '/leads', icon: Users, mobile: true },
        { name: 'Pedidos', path: '/orders', icon: Package, mobile: true },
        { name: 'Caixa', path: '/finances', icon: Wallet, mobile: true },
        { name: 'Configurações', path: '/settings', icon: Settings, mobile: false },
    ];

    const mobileNavItems = navItems.filter(i => i.mobile);

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">

            {/* Sidebar Desktop - Hidden on Mobile */}
            <aside className="hidden md:flex w-64 bg-zinc-950 border-r border-zinc-900 flex-col z-20 transition-all rounded-none">
                <div className="p-6 flex items-center justify-center border-b border-zinc-900">
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <span className="bg-red-600 w-8 h-8 flex items-center justify-center text-white text-lg rounded-none shadow-[4px_4px_0px_#991b1b]">W</span>
                        INIKE
                    </h1>
                </div>

                <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium text-sm rounded-none border-l-2
                  ${isActive
                                        ? 'bg-zinc-900/50 text-red-500 border-red-600 shadow-[inset_4px_0px_0px_#dc2626]'
                                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border-transparent'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-red-500' : 'opacity-70'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-900 mt-auto">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold text-zinc-500 hover:text-red-500 hover:bg-zinc-900 transition-colors uppercase tracking-widest text-left">
                        <LogOut size={16} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-900 flex justify-around items-center z-50 h-[72px] pb-safe">
                {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-red-500 border-red-600 bg-zinc-900/30' : 'text-zinc-500 border-transparent'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-red-500 mb-0.5' : 'opacity-80 mb-0.5'} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Área de Conteúdo */}
            <main className="flex-1 flex flex-col h-full bg-zinc-900 relative overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-zinc-950 border-b border-zinc-900 flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Logo on Mobile only since Sidebar hides */}
                        <div className="md:hidden bg-red-600 w-8 h-8 flex items-center justify-center text-white text-lg rounded-none shadow-[2px_2px_0px_#991b1b]">
                            W
                        </div>
                        <h2 className="text-sm md:text-md font-bold text-zinc-100 uppercase tracking-widest">
                            {navItems.find(i => i.path === location.pathname)?.name || 'Op. System'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right hidden sm:flex">
                            <span className="text-xs font-bold text-zinc-300 uppercase">Admin</span>
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Terminal</span>
                        </div>
                        <div className="w-10 h-10 bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm border border-zinc-700 hover:border-red-500 transition-colors cursor-pointer">
                            <Settings size={18} className="md:hidden" />
                            <span className="hidden md:inline">W</span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area - with bottom padding for mobile bar */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 relative pb-24 md:pb-8">
                    <div className="relative mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
