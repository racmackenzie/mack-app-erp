import { Home, Users, FolderKanban, CalendarDays, LogOut } from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  handleLogout: () => Promise<void> | void;
  isGuest?: boolean;
  onGoToLogin?: () => void;
}

export function Sidebar({ currentRoute, navigate, handleLogout, isGuest = false, onGoToLogin }: SidebarProps) {
  const navItems = [
    { id: '/dashboard', label: 'Início', icon: Home },
    { id: '/associados', label: 'Membros', icon: Users },
    { id: '/projetos', label: 'Projetos', icon: FolderKanban },
    { id: '/calendario', label: 'Agenda', icon: CalendarDays },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-brand-surface border-r border-brand-border shrink-0 z-40">
      <div className="p-6 flex items-center gap-3 border-b border-brand-border">
        <div className="w-10 h-10 bg-brand-surface-raised border border-brand-border rounded-[8px] flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-cranberry"></div>
        </div>
        <div>
          <h1 className="font-bold text-text-main leading-tight">Mackenzie</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Copilot</p>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-colors w-full ${
                isActive ? 'bg-cranberry/10 text-cranberry' : 'text-text-muted hover:bg-brand-surface-raised hover:text-text-main'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {isGuest && (
        <div className="p-4 border-t border-brand-border">
          <button
            onClick={onGoToLogin}
            className="w-full h-10 rounded-[10px] bg-cranberry text-on-cranberry text-[11px] font-bold uppercase tracking-widest hover:bg-cranberry-dark transition-colors"
          >
            Fazer Login
          </button>
        </div>
      )}

      {!isGuest && (
        <div className="p-4 border-t border-brand-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-colors w-full text-text-muted hover:bg-brand-surface-raised hover:text-text-main"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      )}
    </aside>
  );
}
