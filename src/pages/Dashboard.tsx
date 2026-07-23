import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronRight, CirclePlay, LogOut, Star, UserCircle2 } from 'lucide-react';
import { DetalhesEvento, type EventoDetalhes } from '../components/DetalhesEvento';
import { extrairDataLocalISO, formatarDataLocal, formatarPartesDataLocal } from '../lib/dateTime';
import { supabase } from '../lib/supabaseClient';
import { formatProjectStatusLabel } from '../lib/projectStatus';

type AssociateIdentity = {
  foto_url?: string | null;
  nome_social?: string | null;
  nome_completo?: string | null;
  email?: string | null;
};

interface DashboardProps {
  currentAssociate?: AssociateIdentity | null;
  onNavigate?: (route: string) => void;
  onLogout?: () => Promise<void> | void;
  isGuest?: boolean;
  onGoToLogin?: () => void;
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
  liderNome: string;
  liderFotoUrl: string | null;
};

type OrganizerLookup = {
  id: string;
  nome_social: string | null;
  nome_completo: string | null;
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

const normalizeStatus = (value: unknown): string => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const formatCompromissoDate = (isoString: string): string => {
  return formatarDataLocal(isoString) || 'Data a definir';
};

const hojeISO = () => {
  const hoje = new Date();
  const ano = String(hoje.getFullYear());
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

export function Dashboard({ currentAssociate, onNavigate, onLogout, isGuest = false, onGoToLogin }: DashboardProps) {
  const [proximosCompromissos, setProximosCompromissos] = useState<Compromisso[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventoDetalhes | null>(null);
  const [projetosDestaque, setProjetosDestaque] = useState<ProjetoDestaque[]>([]);
  const [isLoadingCompromissos, setIsLoadingCompromissos] = useState(true);
  const [isLoadingProjetos, setIsLoadingProjetos] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  const headerAvatarSrc =
    !isBlank(currentAssociate?.foto_url)
      ? currentAssociate.foto_url.trim()
      : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=ffb2be`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    };

    if (menuAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuAberto]);

  const handleGoToPerfil = () => {
    onNavigate?.('/perfil');
    setMenuAberto(false);
  };

  const handleMenuLogout = async () => {
    setMenuAberto(false);
    await onLogout?.();
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const todayIso = hojeISO();

      try {
        // Public read: convidados e usuários logados carregam os mesmos compromissos.
        const [{ data: compromissosRaw, error: compromissosError }, { data: todosProjetos, error: projetosError }] =
          await Promise.all([
            supabase
              .from('calendario_reunioes')
              .select('*, associados:organizador_id (nome_social, nome_completo)')
              .order('data_hora', { ascending: true })
              .limit(3),
            supabase
              .from('projetos')
              .select('*, associados:lider_id (nome_social, nome_completo, foto_url)'),
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
          const compromissoRows = (compromissosRaw ?? []) as Array<Record<string, unknown>>;
          const organizerIds = Array.from(
            new Set(
              compromissoRows
                .map((row) => row.organizador_id)
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
              console.error('Erro ao carregar organizadores do dashboard:', organizerError);
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

          const parsedCompromissos = (compromissosRaw ?? []).map((row: Record<string, unknown>, index) => {
            const dataHoraRaw = String(row.data_hora ?? row.data ?? row.data_reuniao ?? row.data_inicio ?? row.created_at ?? '');
            const local = pickFirstString(
              row,
              ['local', 'link_meet', 'endereco', 'endereço', 'sala'],
              'Local a definir'
            );
            const formato = local.toLowerCase().startsWith('http') ? 'Online' : 'Presencial';
            const { dia, mes, hora } = formatarPartesDataLocal(dataHoraRaw);
            const dataHoraFormatada = formatarDataLocal(dataHoraRaw);
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
            const associadosByJoin =
              row.associados && typeof row.associados === 'object'
                ? (row.associados as { nome_social?: string | null; nome_completo?: string | null })
                : null;
            const organizerId = typeof row.organizador_id === 'string' ? row.organizador_id : null;
            const organizerById = organizerId ? organizerLookup.get(organizerId) ?? null : null;
            const associados = associadosByJoin ??
              (organizerById
                ? {
                    nome_social: organizerById.nome_social,
                    nome_completo: organizerById.nome_completo,
                  }
                : null);

            return {
              id: String(row.id ?? `compromisso-${index}`),
              titulo: pickFirstString(row, ['titulo', 'nome', 'assunto'], 'Compromisso sem título'),
              data: formatCompromissoDate(dataHoraRaw),
              referente,
              isUrgent: extrairDataLocalISO(dataHoraRaw) === todayIso,
              detalhesEvento: {
                id: String(row.id ?? `compromisso-${index}`),
                titulo: pickFirstString(row, ['titulo', 'nome', 'assunto'], 'Compromisso sem título'),
                dia,
                mes,
                hora,
                referente,
                formato,
                local,
                dataHoraFormatada,
                associados,
                organizador: associados?.nome_social || associados?.nome_completo || organizador,
              },
            } satisfies Compromisso;
          });
          setProximosCompromissos(parsedCompromissos);
        }

        if (projetosError) {
          console.error('Erro ao buscar projetos em destaque:', projetosError);
          setProjetosDestaque([]);
        } else {
          // Prioridade de destaque: Em Andamento > Planejamento > Concluídos/Finalizados.
          let emDestaque =
            todosProjetos?.filter((projeto) => {
              const status = normalizeStatus(projeto.status);
              return status.includes('andamento') || status.includes('execucao');
            }) ?? [];

          if (emDestaque.length === 0) {
            emDestaque =
              todosProjetos?.filter((projeto) => {
                const status = normalizeStatus(projeto.status);
                return status.includes('planejamento');
              }) ?? [];
          }

          if (emDestaque.length === 0) {
            emDestaque =
              todosProjetos?.filter((projeto) => {
                const status = normalizeStatus(projeto.status);
                return status.includes('concluido') || status.includes('finalizado');
              }) ?? [];
          }

          const parsedProjetos = emDestaque.slice(0, 3).map((row: Record<string, unknown>, index) => {
            const associadoByJoin =
              row.associados && typeof row.associados === 'object'
                ? (row.associados as { nome_social?: string | null; nome_completo?: string | null; foto_url?: string | null })
                : null;
            const liderNome =
              associadoByJoin?.nome_social?.trim() ||
              associadoByJoin?.nome_completo?.trim() ||
              pickFirstString(row, ['lider_nome', 'lider', 'responsavel', 'responsavel_nome'], 'Liderança não definida');

            return {
              id: String(row.id ?? `projeto-${index}`),
              nome: pickFirstString(row, ['nome_projeto', 'nome', 'titulo'], 'Projeto sem nome'),
              avenida: pickFirstString(row, ['avenida', 'categoria'], 'Sem avenida'),
              status: pickFirstString(row, ['status'], 'Sem status'),
              liderNome,
              liderFotoUrl: associadoByJoin?.foto_url?.trim() || null,
            } satisfies ProjetoDestaque;
          });

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
    <div className="min-h-screen bg-brand-bg pb-2">
      {/* Header */}
      <header className="px-4 pt-12 pb-6 border-b border-brand-border bg-brand-surface-raised sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold tracking-[0.05em] uppercase text-text-muted mb-1">
              Bem-vindo(a)
            </h2>
            {!isGuest && <h1 className="text-2xl font-bold text-text-main tracking-tight">{displayName}</h1>}
          </div>
          {isGuest && (
            <button
              type="button"
              onClick={onGoToLogin}
              className="md:hidden bg-cranberry text-on-cranberry text-xs font-bold tracking-wide uppercase px-4 h-10 rounded-[10px] shadow-sm active:scale-[0.98] transition-transform"
            >
              Fazer login
            </button>
          )}
          {!isGuest && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuAberto(!menuAberto)}
                className="w-12 h-12 rounded-[12px] bg-brand-surface border border-brand-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-cranberry/40"
                aria-haspopup="menu"
                aria-expanded={menuAberto}
                aria-label="Abrir menu de perfil"
              >
                <img
                  src={headerAvatarSrc}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </button>

              {menuAberto && (
                <div className="absolute right-0 top-14 z-50 bg-white shadow-lg rounded-xl border border-gray-100 p-2 w-40">
                  <button
                    type="button"
                    onClick={handleGoToPerfil}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <UserCircle2 size={16} />
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMenuLogout()}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          )}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingProjetos &&
              [1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex flex-col gap-4 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-surface-raised border border-brand-border" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-brand-surface-raised rounded" />
                    <div className="h-4 w-5/6 bg-brand-surface-raised rounded" />
                    <div className="h-3 w-1/2 bg-brand-surface-raised rounded" />
                  </div>
                  <div className="h-9 w-28 bg-brand-surface-raised rounded" />
                </div>
              ))}

            {!isLoadingProjetos &&
              projetosDestaque.map((projeto) => (
                <div
                  key={projeto.id}
                  className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex flex-col gap-4"
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
                      <span>{formatProjectStatusLabel(projeto.status)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={projeto.liderFotoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(projeto.liderNome)}&backgroundColor=ffb2be`}
                        alt={`Avatar de ${projeto.liderNome}`}
                        className="w-8 h-8 rounded-full border border-brand-border object-cover shrink-0"
                      />
                      <span className="text-xs text-text-muted truncate">{projeto.liderNome}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate?.('/projetos')}
                      className="text-[10px] font-bold uppercase tracking-widest text-cranberry shrink-0"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}

            {!isLoadingProjetos && projetosDestaque.length === 0 && (
              <div className="col-span-full bg-brand-surface border border-dashed border-brand-border rounded-[12px] p-6 text-center text-sm text-text-muted">
                Nenhum projeto encontrado.
              </div>
            )}
          </div>
        </section>

      </main>

      {selectedEvent && <DetalhesEvento evento={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
