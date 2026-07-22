import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, CirclePlay, Star } from 'lucide-react';
import { DetalhesEvento, type EventoDetalhes } from '../components/DetalhesEvento';
import { supabase } from '../lib/supabaseClient';

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo';

type AssociateIdentity = {
  nome_social?: string | null;
  nome_completo?: string | null;
  email?: string | null;
};

interface DashboardProps {
  currentAssociate?: AssociateIdentity | null;
  onNavigate?: (route: string) => void;
}

type Compromisso = {
  id: string;
  titulo: string;
  data: string;
  referente: string;
  isUrgent: boolean;
  detalhesEvento: EventoDetalhes;
};

type ProjetoDestaque = {
  id: string;
  nome: string;
  avenida: string;
  status: string;
};

const isBlank = (value: unknown): value is '' | null | undefined =>
  typeof value !== 'string' || value.trim().length === 0;

const pickFirstString = (source: Record<string, unknown>, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
};

const toDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const toSaoPauloDateKey = (date: Date): string =>
  date.toLocaleDateString('en-CA', { timeZone: BRAZIL_TIME_ZONE });

const formatCompromissoDate = (date: Date | null): string => {
  if (!date) {
    return 'Data a definir';
  }

  const now = new Date();
  const isToday = toSaoPauloDateKey(now) === toSaoPauloDateKey(date);

  const hour = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BRAZIL_TIME_ZONE,
  });

  if (isToday) {
    return `Hoje, ${hour}`;
  }

  const dayLabel = date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: BRAZIL_TIME_ZONE,
  });

  return `${dayLabel}, ${hour}`;
};

export function Dashboard({ currentAssociate, onNavigate }: DashboardProps) {
  const [proximosCompromissos, setProximosCompromissos] = useState<Compromisso[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventoDetalhes | null>(null);
  const [projetosDestaque, setProjetosDestaque] = useState<ProjetoDestaque[]>([]);
  const [isLoadingCompromissos, setIsLoadingCompromissos] = useState(true);
  const [isLoadingProjetos, setIsLoadingProjetos] = useState(true);

  const displayName = useMemo(() => {
    if (!currentAssociate) {
      return 'Usuário';
    }

    if (!isBlank(currentAssociate.nome_social)) {
      return currentAssociate.nome_social.trim();
    }

    if (!isBlank(currentAssociate.nome_completo)) {
      return currentAssociate.nome_completo.trim();
    }

    if (!isBlank(currentAssociate.email)) {
      return currentAssociate.email.trim();
    }

    return 'Usuário';
  }, [currentAssociate]);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const today = new Date();

      try {
        // Public read: convidados e usuários logados carregam os mesmos compromissos.
        const [{ data: compromissosRaw, error: compromissosError }, { data: projetosRaw, error: projetosError }] =
          await Promise.all([
            supabase
              .from('calendario_reunioes')
              .select('*, associados:organizador_id (nome_social, nome_completo)')
              .order('data_hora', { ascending: true })
              .limit(3),
            supabase
              .from('projetos')
              .select('*')
              .or('status.eq.Em Andamento,status.eq.em_andamento')
              .limit(4),
          ]);

        console.log('Compromissos retornados do banco:', compromissosRaw);
        console.log('Erro na busca de compromissos:', compromissosError);

        if (!isMounted) {
          return;
        }

        if (compromissosError) {
          console.error('Erro ao buscar próximos compromissos:', compromissosError);
          setProximosCompromissos([]);
        } else {
          const parsedCompromissos = (compromissosRaw ?? []).map((row: Record<string, unknown>, index) => {
            const date = toDate(row.data_hora ?? row.data ?? row.data_reuniao ?? row.data_inicio ?? row.created_at);
            const local = pickFirstString(
              row,
              ['local', 'link_meet', 'endereco', 'endereço', 'sala'],
              'Local a definir'
            );
            const formato = local.toLowerCase().startsWith('http') ? 'Online' : 'Presencial';
            const dia = date
              ? date.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: BRAZIL_TIME_ZONE })
              : '--';
            const mes = date
              ? date.toLocaleString('pt-BR', { month: 'short', timeZone: BRAZIL_TIME_ZONE }).replace('.', '')
              : '--';
            const hora = date
              ? date.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: BRAZIL_TIME_ZONE,
                })
              : '--:--';
            const referente = pickFirstString(
              row,
              ['referente_a', 'tipo', 'referente', 'categoria', 'origem'],
              'Clube'
            );
            const organizador = pickFirstString(
              row,
              ['organizador', 'organizador_nome', 'responsavel', 'responsavel_nome'],
              'Diretoria do Clube'
            );
            const associados =
              row.associados && typeof row.associados === 'object'
                ? (row.associados as { nome_social?: string | null; nome_completo?: string | null })
                : null;

            return {
              id: String(row.id ?? `compromisso-${index}`),
              titulo: pickFirstString(row, ['titulo', 'nome', 'assunto'], 'Compromisso sem título'),
              data: formatCompromissoDate(date),
              referente,
              isUrgent:
                !!date && toSaoPauloDateKey(date) === toSaoPauloDateKey(today),
              detalhesEvento: {
                id: String(row.id ?? `compromisso-${index}`),
                titulo: pickFirstString(row, ['titulo', 'nome', 'assunto'], 'Compromisso sem título'),
                dia,
                mes,
                hora,
                referente,
                formato,
                local,
                associados,
                organizador,
              },
            } satisfies Compromisso;
          });
          setProximosCompromissos(parsedCompromissos);
        }

        if (projetosError) {
          console.error('Erro ao buscar projetos em destaque:', projetosError);
          setProjetosDestaque([]);
        } else {
          const parsedProjetos = (projetosRaw ?? []).map((row: Record<string, unknown>, index) => ({
            id: String(row.id ?? `projeto-${index}`),
            nome: pickFirstString(row, ['nome', 'titulo'], 'Projeto sem nome'),
            avenida: pickFirstString(row, ['avenida', 'categoria'], 'Sem avenida'),
            status: pickFirstString(row, ['status'], 'Sem status'),
          }));
          setProjetosDestaque(parsedProjetos);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error('Erro ao carregar dados do dashboard:', error);
        setProximosCompromissos([]);
        setProjetosDestaque([]);
      } finally {
        if (!isMounted) {
          return;
        }
        setIsLoadingCompromissos(false);
        setIsLoadingProjetos(false);
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Header */}
      <header className="px-4 pt-12 pb-6 border-b border-brand-border bg-brand-surface-raised sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold tracking-[0.05em] uppercase text-text-muted mb-1">
              Bem-vindo(a)
            </h2>
            <h1 className="text-2xl font-bold text-text-main tracking-tight">{displayName}</h1>
          </div>
          <div className="w-12 h-12 rounded-[12px] bg-brand-surface border border-brand-border overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ffb2be`} 
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
            <button
              onClick={() => onNavigate?.('/calendario')}
              className="text-xs font-bold uppercase tracking-widest text-cranberry flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCompromissos &&
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex gap-4 items-start animate-pulse"
                >
                  <div className="bg-brand-bg rounded-lg border border-brand-border w-14 h-14 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-brand-bg rounded" />
                    <div className="h-3 w-1/2 bg-brand-bg rounded" />
                    <div className="h-5 w-20 bg-brand-bg rounded" />
                  </div>
                </div>
              ))}

            {!isLoadingCompromissos &&
              proximosCompromissos.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex gap-4 items-start cursor-pointer hover:border-cranberry hover:ring-1 hover:ring-cranberry active:bg-brand-surface-raised transition-colors"
                  onClick={() => setSelectedEvent(evento.detalhesEvento)}
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

            {!isLoadingCompromissos && proximosCompromissos.length === 0 && (
              <div className="col-span-full bg-brand-surface border border-dashed border-brand-border rounded-[12px] p-6 text-center text-sm text-text-muted">
                Nenhum compromisso futuro cadastrado.
              </div>
            )}
          </div>
        </section>

        {/* Projetos em Destaque */}
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <h3 className="text-lg font-semibold text-text-main tracking-tight">Projetos em Destaque</h3>
            <button
              onClick={() => onNavigate?.('/projetos')}
              className="text-xs font-bold uppercase tracking-widest text-cranberry flex items-center gap-1"
            >
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoadingProjetos &&
              [1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex flex-col justify-between aspect-square animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-surface-raised border border-brand-border" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-brand-surface-raised rounded" />
                    <div className="h-4 w-5/6 bg-brand-surface-raised rounded" />
                    <div className="h-3 w-1/2 bg-brand-surface-raised rounded" />
                  </div>
                </div>
              ))}

            {!isLoadingProjetos &&
              projetosDestaque.map((projeto) => (
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

            {!isLoadingProjetos && projetosDestaque.length === 0 && (
              <div className="col-span-full bg-brand-surface border border-dashed border-brand-border rounded-[12px] p-6 text-center text-sm text-text-muted">
                Nenhum projeto em andamento encontrado.
              </div>
            )}
          </div>
        </section>

      </main>

      {selectedEvent && <DetalhesEvento evento={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
