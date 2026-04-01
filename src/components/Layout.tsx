import { Outlet, Link, useLocation } from 'react-router-dom';
import { BarChart3, UserPlus, Package, Sliders, Wallet, Zap, ShoppingCart } from 'lucide-react';

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: BarChart3, mobile: true },
        { name: 'Produtos', path: '/products', icon: Package, mobile: true },
        { name: 'Campanhas', path: '/campaigns', icon: Zap, mobile: true },
        { name: 'Leads', path: '/leads', icon: UserPlus, mobile: true },
        { name: 'Pedidos', path: '/orders', icon: ShoppingCart, mobile: true },
        { name: 'Caixa', path: '/finances', icon: Wallet, mobile: true },
        { name: 'Configurações', path: '/settings', icon: Sliders, mobile: true },
    ];

    const mobileNavItems = navItems.filter(i => i.mobile);

    return (
        <div className="flex h-screen bg-[#0D0D0D] text-[#F0EFE8] font-sans overflow-hidden">

            {/* Sidebar Desktop - Hidden on Mobile */}
            <aside className="hidden md:flex w-64 bg-[#1A1A1A] border-r border-default flex-col z-20 transition-all shadow-lg">
                <div className="p-6 flex items-center justify-center border-b border-default">
                    <h1 className="text-xl font-medium text-white flex items-center gap-3">
                        <img src="/logo.png" alt="DropHub Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                        Drop Hub
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
                                className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 font-medium text-[13px] rounded-lg border
                  ${isActive
                                        ? 'bg-green-400/10 text-green-400 border-green-500/30'
                                        : 'text-[#888780] hover:text-[#F0EFE8] hover:bg-[#2A2A2A] border-transparent'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-green-400' : 'opacity-70'} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>


            </aside>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1A1A1A] border-t border-default flex justify-around items-center z-50 h-[72px] pb-safe shadow-lg">
                {mobileNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors border-t-2 ${isActive ? 'text-green-400 border-green-400 bg-green-400/5' : 'text-[#888780] border-transparent'
                                }`}
                        >
                            <Icon size={24} className={isActive ? 'text-green-400' : 'opacity-80'} />
                        </Link>
                    )
                })}
            </nav>

            {/* Área de Conteúdo */}
            <main className="flex-1 flex flex-col h-full bg-[#0D0D0D] relative overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-[#1A1A1A] border-b border-default flex items-center px-4 md:px-8 justify-between sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Logo on Mobile only since Sidebar hides */}
                        <img src="/logo.png" alt="Logo" className="md:hidden w-7 h-7 rounded-sm shadow-sm" />
                        <h2 className="text-sm font-medium text-[#F0EFE8]">
                            {navItems.find(i => i.path === location.pathname)?.name || 'Op. System'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col text-right hidden sm:flex">
                            <span className="text-[13px] font-medium text-[#E8E6DF]">Admin</span>
                            <span className="text-[11px] text-[#888780]">Terminal</span>
                        </div>
                        <div className="w-9 h-9 bg-[#2A2A2A] text-[#E8E6DF] rounded-full flex items-center justify-center font-medium text-[13px] border border-default hover:border-green-400 transition-colors cursor-pointer">
                            <Sliders size={16} className="md:hidden" />
                            <span className="hidden md:inline">DH</span>
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
