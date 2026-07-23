import { Home, Users, FolderKanban, CalendarDays } from 'lucide-react';

interface BottomNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export function BottomNav({ currentRoute, navigate }: BottomNavProps) {
  const navItems = [
    { id: '/dashboard', label: 'Início', icon: Home },
    { id: '/associados', label: 'Membros', icon: Users },
    { id: '/projetos', label: 'Projetos', icon: FolderKanban },
    { id: '/calendario', label: 'Agenda', icon: CalendarDays },
  ];

  return (
    <>
      <div className="h-28 w-full md:hidden" aria-hidden="true" />
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-brand-bg border-t border-brand-border pb-safe pt-2 px-4">
        <div className="flex justify-between items-center max-w-md mx-auto h-16">
          {navItems.map((item) => {
            const isActive = currentRoute === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  isActive ? 'text-cranberry' : 'text-text-muted hover:text-text-main'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
