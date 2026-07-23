import { Home, Users, FolderKanban, CalendarDays, LogOut } from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  navigate: (route: string) => void;
  handleLogout: () => Promise<void> | void;
  isGuest?: boolean;
  onGoToLogin?: () => void;
  hasSession?: boolean;
  userProfile?: {
    foto_url: string | null;
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
}

export function Sidebar({
  currentRoute,
  navigate,
  handleLogout,
  isGuest = false,
  onGoToLogin,
  hasSession = false,
  userProfile = null,
}: SidebarProps) {
  const navItems = [
    { id: '/dashboard', label: 'Início', icon: Home },
    { id: '/associados', label: 'Membros', icon: Users },
    { id: '/projetos', label: 'Projetos', icon: FolderKanban },
    { id: '/calendario', label: 'Agenda', icon: CalendarDays },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-brand-surface border-r border-brand-border shrink-0 z-40">
      <div className="px-4 py-4 mb-2 flex items-center justify-start border-b border-brand-border">
        <img
          src="/logo-rotaract-mackenzie.png"
          alt="Rotaract Club Universidade Mackenzie"
          className="h-10 w-auto object-contain"
        />
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
