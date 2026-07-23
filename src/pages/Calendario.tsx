import { useCallback, useEffect, useState } from 'react';
import { Clock, MapPin, Video, Plus } from 'lucide-react';
import { AddEventoForm } from '../components/AddEventoForm';
import { DetalhesEvento } from '../components/DetalhesEvento';
import { formatarDataLocal, formatarPartesDataLocal } from '../lib/dateTime';
import { supabase } from '../lib/supabaseClient';

type CalendarioReuniao = {
  id: string;
  titulo: string;
  data_hora: string;
  referente_a: string | null;
  projeto_id: string | null;
  organizador_id: string | null;
  local: string | null;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
};

type OrganizerLookup = {
  id: string;
  nome_social: string | null;
  nome_completo: string | null;
};

type EventoCard = {
  id: string;
  titulo: string;
  dia: string;
  mes: string;
  hora: string;
  dataHoraFormatada: string;
  referente: string;
  formato: string;
  local: string;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
  } | null;
  projetoVinculado?: string;
  organizador?: string;
};

const pickFirstString = (source: Record<string, unknown>, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
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

    const rows = (data ?? []) as CalendarioReuniao[];
    const organizerIds = Array.from(
      new Set(
        rows
          .map((evento) => evento.organizador_id)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      )
    );

    const organizerLookup = new Map<string, OrganizerLookup>();

    if (organizerIds.length > 0) {
      const { data: organizerRows, error: organizerError } = await supabase
        .from('associados')
        .select('id, nome_social, nome_completo')
        .in('id', organizerIds);

      if (organizerError) {
        console.error('Erro ao carregar organizadores da agenda:', organizerError);
      } else {
        (organizerRows ?? []).forEach((organizer) => {
          organizerLookup.set(String(organizer.id), {
            id: String(organizer.id),
            nome_social: organizer.nome_social ?? null,
            nome_completo: organizer.nome_completo ?? null,
          });
        });
      }
    }

    const eventosDaTabela = rows.map((evento: CalendarioReuniao) => {
      const eventoRaw = evento as unknown as Record<string, unknown>;
      const dataHoraRaw = String(
        eventoRaw.data_hora ?? eventoRaw.data ?? eventoRaw.data_reuniao ?? eventoRaw.data_inicio ?? eventoRaw.created_at
      );
      const dataHoraFormatada = formatarDataLocal(dataHoraRaw);
      const partesDataHora = formatarPartesDataLocal(dataHoraRaw);
      const local = pickFirstString(eventoRaw, ['local', 'link_meet', 'endereco', 'endereço', 'sala'], 'Local a definir');
      const referente = pickFirstString(eventoRaw, ['referente_a', 'tipo', 'referente', 'categoria', 'origem'], 'CLUBE');
      const organizador = pickFirstString(
        eventoRaw,
        ['organizador', 'organizador_nome', 'responsavel', 'responsavel_nome'],
        'Diretoria do Clube'
      );
      const organizadorById = evento.organizador_id ? organizerLookup.get(evento.organizador_id) ?? null : null;
      const associadosByJoin =
        evento.associados && typeof evento.associados === 'object'
          ? {
              nome_social: evento.associados.nome_social ?? null,
              nome_completo: evento.associados.nome_completo ?? null,
            }
          : null;
      const associados = associadosByJoin ??
        (organizadorById
          ? {
              nome_social: organizadorById.nome_social,
              nome_completo: organizadorById.nome_completo,
            }
          : null);

      return {
        id: evento.id,
        titulo: pickFirstString(eventoRaw, ['titulo', 'nome', 'assunto'], 'Compromisso sem título'),
        dia: partesDataHora.dia,
        mes: partesDataHora.mes,
        hora: partesDataHora.hora,
        dataHoraFormatada,
        referente,
        formato: local.toLowerCase().startsWith('http') ? 'Online' : 'Presencial',
        local,
        associados,
        projetoVinculado: evento.projeto_id ? `Projeto ${evento.projeto_id}` : undefined,
        organizador: associados?.nome_social || associados?.nome_completo || organizador,
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
    <div className="min-h-screen bg-brand-bg pb-2">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-brand-surface-raised border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Calendário</h1>
            <button
              onClick={handleOpenAddForm}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all shadow-sm ${
                isGuest
                  ? 'bg-brand-surface border border-brand-border text-text-muted'
                  : 'bg-[#E31C59] hover:bg-[#c41549] text-white'
              }`}
              aria-label={isGuest ? 'Ação indisponível para convidado' : 'Novo compromisso'}
            >
              <Plus size={16} />
              <span>Novo Compromisso</span>
            </button>
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
                  <span>{evento.dataHoraFormatada || '--'}</span>
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
