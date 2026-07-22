import { useCallback, useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Video, Plus } from 'lucide-react';
import { AddEventoForm } from '../components/AddEventoForm';
import { DetalhesEvento } from '../components/DetalhesEvento';
import { supabase } from '../lib/supabaseClient';

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';

type CalendarioReuniao = {
  id: string;
  titulo: string;
  data_hora: string;
  referente_a: string | null;
  projeto_id: string | null;
  local: string | null;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
};

type EventoCard = {
  id: string;
  titulo: string;
  dia: string;
  mes: string;
  hora: string;
  referente: string;
  formato: string;
  local: string;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
  projetoVinculado?: string;
};

interface CalendarioProps {
  isGuest?: boolean;
  onGuestBlockedAction?: () => void;
}

export function Calendario({ isGuest = false, onGuestBlockedAction }: CalendarioProps) {
  const [filtroAtivo, setFiltroAtivo] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<EventoCard | null>(null);
  const [eventos, setEventos] = useState<EventoCard[]>([]);

  const fetchEvents = useCallback(async () => {
    // Leitura pública: a agenda deve carregar para visitantes logados e convidados.
    const { data, error } = await supabase
      .from('calendario_reunioes')
      .select('*, associados:organizador_id (nome_social, nome_completo)')
      .order('data_hora', { ascending: true });

    if (error) {
      console.error('Erro ao carregar compromissos:', error);
      return;
    }

    const eventosDaTabela = (data ?? []).map((evento: CalendarioReuniao) => {
      const dataEvento = new Date(evento.data_hora);
      const dataValida = !Number.isNaN(dataEvento.getTime());

      return {
        id: evento.id,
        titulo: evento.titulo,
        dia: dataValida
          ? dataEvento.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: BRAZIL_TIME_ZONE })
          : '--',
        mes: dataValida
          ? dataEvento
              .toLocaleString('pt-BR', { month: 'short', timeZone: BRAZIL_TIME_ZONE })
              .replace('.', '')
          : '--',
        hora: dataValida
          ? dataEvento.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: BRAZIL_TIME_ZONE,
            })
          : '--:--',
        referente: evento.referente_a ?? 'CLUBE',
        formato: evento.local?.toLowerCase().startsWith('http') ? 'Online' : 'Presencial',
        local: evento.local ?? 'Local a definir',
        associados: evento.associados,
        projetoVinculado: evento.projeto_id ? `Projeto ${evento.projeto_id}` : undefined,
      };
    });

    setEventos(eventosDaTabela);
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const filtros = ['Todos', ...Array.from(new Set(eventos.map((evento) => evento.referente)))];

  const eventosFiltrados = filtroAtivo === 'Todos' 
    ? eventos 
    : eventos.filter(e => e.referente === filtroAtivo);

  const handleOpenAddForm = () => {
    if (isGuest) {
      onGuestBlockedAction?.();
      return;
    }

    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-brand-surface-raised border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Calendário</h1>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-[12px] bg-brand-surface border border-brand-border flex items-center justify-center text-cranberry">
                <CalendarIcon size={20} />
              </div>
              <button
                onClick={handleOpenAddForm}
                className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors ${
                  isGuest
                    ? 'bg-brand-surface border border-brand-border text-text-muted'
                    : 'bg-cranberry text-on-cranberry hover:bg-cranberry-dark'
                }`}
                aria-label={isGuest ? 'Ação indisponível para convidado' : 'Novo compromisso'}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {filtros.map((filtro) => (
              <button
                key={filtro}
                onClick={() => setFiltroAtivo(filtro)}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  filtroAtivo === filtro 
                    ? 'bg-cranberry text-on-cranberry border-cranberry' 
                    : 'bg-brand-surface border-brand-border text-text-muted hover:bg-brand-surface-raised'
                }`}
              >
                {filtro}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md md:max-w-7xl md:px-12 mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
        {eventosFiltrados.map((evento) => (
          
          <div 
            key={evento.id} 
            className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex gap-4 relative overflow-hidden group cursor-pointer hover:border-cranberry hover:ring-1 hover:ring-cranberry active:scale-[0.98] transition-all"
            onClick={() => setSelectedEvento(evento)}
          >
            {/* Indicador de cor referente */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${evento.referente.toUpperCase() === 'CLUBE' ? 'bg-cranberry' : evento.referente.toUpperCase().includes('DISTRITO') ? 'bg-rotary-yellow' : 'bg-brand-border'}`}></div>
            
            {/* Data Block */}
            <div className="flex flex-col items-center justify-center w-14 shrink-0">
              <span className="text-sm font-bold uppercase tracking-widest text-text-muted mb-[-4px]">{evento.mes}</span>
              <span className="text-3xl font-bold text-text-main tracking-tighter">{evento.dia}</span>
            </div>
            
            {/* Divider */}
            <div className="w-px bg-brand-border h-auto"></div>
            
            {/* Detalhes */}
            <div className="flex-1 min-w-0 py-1">
              <span className="inline-block px-2 py-1 rounded-[4px] bg-brand-surface-raised border border-brand-border text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2">
                {evento.referente}
              </span>
              
              <h3 className="font-semibold text-text-main leading-tight mb-3 pr-4">
                {evento.titulo}
              </h3>
              
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  <Clock size={14} className="text-cranberry" />
                  <span>{evento.hora}</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  {evento.formato === 'Online' ? (
                    <Video size={14} className="text-cranberry" />
                  ) : (
                    <MapPin size={14} className="text-cranberry" />
                  )}
                  <span className="truncate">{evento.local}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {eventosFiltrados.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-text-muted">Nenhum evento programado.</p>
          </div>
        )}
      </main>

      {showAddForm && !isGuest && <AddEventoForm onClose={() => setShowAddForm(false)} onSaved={fetchEvents} />}
      {selectedEvento && <DetalhesEvento evento={selectedEvento} onClose={() => setSelectedEvento(null)} />}
    </div>
  );
}
