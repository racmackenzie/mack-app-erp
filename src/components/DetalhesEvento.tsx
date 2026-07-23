import { ArrowLeft, Clock, MapPin, Video, User, Briefcase } from 'lucide-react';

export interface EventoDetalhes {
  id: string;
  titulo: string;
  dia: string;
  mes: string;
  hora: string;
  dataHoraFormatada?: string;
  referente: string;
  formato: string;
  local: string;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
  projetoVinculado?: string;
  organizador?: string;
}

interface DetalhesEventoProps {
  evento: EventoDetalhes;
  onClose: () => void;
}

export function DetalhesEvento({ evento, onClose }: DetalhesEventoProps) {
  const isRotary = evento.referente === 'Distrito 4563';
  const localNormalizado = evento.local.trim().toLowerCase();
  const isOnline = localNormalizado.startsWith('http');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center gap-3 bg-brand-surface shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-text-main truncate">Detalhes do Evento</h2>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
        <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <div className="flex flex-col items-start gap-4">
            <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${
              isRotary 
                ? 'bg-rotary-yellow/10 border-rotary-yellow/20 text-[#d97706]'
                : 'bg-brand-surface-raised border-brand-border text-text-muted'
            }`}>
              {evento.referente}
            </span>

            <h1 className="text-3xl font-bold text-text-main leading-tight">
              {evento.titulo}
            </h1>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cranberry/10 flex items-center justify-center text-cranberry shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">
                  {evento.dataHoraFormatada || `${evento.dia} de ${evento.mes}, às ${evento.hora}`}
                </p>
                <p className="text-[12px] text-text-muted">Horário de Brasília</p>
              </div>
            </div>

            <div className="w-full h-px bg-brand-border my-1"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-surface-raised flex items-center justify-center text-text-muted shrink-0">
                {isOnline ? <Video size={20} /> : <MapPin size={20} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">{evento.local}</p>
                <p className="text-[12px] text-text-muted">{isOnline ? 'Online' : 'Presencial'}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
             {evento.projetoVinculado && (
              <>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                    Projeto Vinculado
                  </span>
                  <button className="flex items-center gap-2 text-sm text-text-main hover:text-cranberry transition-colors font-medium">
                    <Briefcase size={16} className="text-text-muted" />
                    {evento.projetoVinculado}
                  </button>
                </div>
                <div className="w-full h-px bg-brand-border my-1"></div>
              </>
            )}

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                Organizador
              </span>
              <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                <User size={16} className="text-text-muted" />
                {evento.associados?.nome_social || evento.associados?.nome_completo || evento.organizador || 'Diretoria do Clube'}
              </div>
            </div>
          </div>
        </div>
      </main>

      {isOnline ? (
        <footer className="p-4 pb-2 md:pb-4 bg-brand-surface border-t border-brand-border shrink-0 mt-auto">
          <div className="max-w-md mx-auto">
            <a
              href={evento.local}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-cranberry-dark active:scale-[0.98] transition-all"
            >
              <Video size={20} />
              Acessar Reunião Online
            </a>
          </div>
        </footer>
      ) : null}
      </div>
    </div>
  );
}
