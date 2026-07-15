import { Calendar, ChevronRight, CirclePlay, Star } from 'lucide-react';

export function Dashboard() {
  const proximosCompromissos = [
    {
      id: 1,
      titulo: 'Reunião Ordinária',
      data: 'Hoje, 19:30',
      referente: 'Clube',
      isUrgent: true,
    },
    {
      id: 2,
      titulo: 'Assembleia Distrital',
      data: 'Sáb, 23 Nov, 09:00',
      referente: 'Distrito 4563',
      isUrgent: false,
    },
  ];

  const projetosDestaque = [
    {
      id: 1,
      nome: 'Campanha do Agasalho',
      avenida: 'Comunitários',
      status: 'Em Andamento',
    },
    {
      id: 2,
      nome: 'Mentoria Profissional',
      avenida: 'Profissionais',
      status: 'Planejamento',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6 border-b border-brand-border bg-brand-surface-raised sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold tracking-[0.05em] uppercase text-text-muted mb-1">
              Bem-vindo(a)
            </h2>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">João Silva</h1>
          </div>
          <div className="w-12 h-12 rounded-[12px] bg-brand-surface border border-brand-border overflow-hidden">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Joao&backgroundColor=ffb2be" 
              alt="Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-8 flex flex-col gap-10 max-w-md md:max-w-7xl md:px-12 mx-auto w-full">
        
        {/* Próximos Compromissos */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-semibold text-text-main tracking-tight">Próximos Compromissos</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-cranberry flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximosCompromissos.map((evento) => (
              <div 
                key={evento.id} 
                className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex gap-4 items-start active:bg-brand-surface-raised transition-colors"
              >
                <div className="flex flex-col items-center justify-center bg-brand-bg rounded-lg border border-brand-border w-14 h-14 shrink-0">
                  <Calendar size={20} className={evento.isUrgent ? 'text-cranberry' : 'text-text-main'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-text-main truncate">{evento.titulo}</h4>
                  <p className="text-sm text-text-muted mt-0.5">{evento.data}</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-[4px] bg-brand-surface border border-brand-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {evento.referente}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projetos em Destaque */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-semibold text-text-main tracking-tight">Projetos em Destaque</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projetosDestaque.map((projeto) => (
              <div 
                key={projeto.id}
                className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex flex-col justify-between aspect-square"
              >
                <div className="flex justify-between items-start">
                  <div className="w-8 h-8 rounded-full bg-brand-surface-raised border border-brand-border flex items-center justify-center">
                    <Star size={14} className="text-cranberry" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1 truncate">
                    {projeto.avenida}
                  </p>
                  <h4 className="font-semibold text-text-main leading-tight mb-2 line-clamp-2">
                    {projeto.nome}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                    <CirclePlay size={12} className="text-cranberry" />
                    <span>{projeto.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
