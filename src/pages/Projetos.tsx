import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Star, CirclePlay, ChevronRight, Plus } from 'lucide-react';
import { AddProjetoForm } from '../components/AddProjetoForm';
import { DetalhesProjeto } from '../components/DetalhesProjeto';
import { supabase } from '../lib/supabaseClient';

interface ProjetosProps {
  isGuest?: boolean;
  onGuestBlockedAction?: () => void;
}

type Projeto = {
  id: string;
  nome: string;
  avenida: string;
  status: string;
  marcoAtual: string;
  lider: string;
  detalhes: string;
  linkGrupo?: string | null;
  lider_id?: string | null;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
    foto_url: string | null;
  } | null;
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

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const STATUS_DISPLAY_ORDER = ['Planejamento', 'Em Andamento', 'Concluído'];

export function Projetos({ isGuest = false, onGuestBlockedAction }: ProjetosProps) {
  const [selectedAvenida, setSelectedAvenida] = useState<string>('TODAS');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [isLoadingProjetos, setIsLoadingProjetos] = useState(true);

  const avenidas = [
    'TODAS',
    'COMUNITÁRIOS',
    'PROFISSIONAIS',
    'IMAGEM PÚBLICA',
    'DESENVOLVIMENTO DE QUADRO',
  ];

  const loadProjetos = useCallback(async () => {
    setIsLoadingProjetos(true);

    try {
      const { data, error } = await supabase
        .from('projetos')
        .select('*, associados:lider_id (nome_social, nome_completo, foto_url)')
        .order('created_at', { ascending: false });

      console.log('Projetos retornados do banco:', data);
      console.log('Erro na busca de projetos:', error);

      if (error) {
        console.error('Erro ao buscar projetos no Supabase:', error);
        setProjetos([]);
        return;
      }

      const projetoRows = (data ?? []) as Array<Record<string, unknown>>;

      const parsedProjetos = projetoRows.map((row, index) => {
        const liderId = typeof row.lider_id === 'string' ? row.lider_id : '';
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
          avenida: pickFirstString(row, ['avenida', 'categoria', 'area'], 'Sem categoria'),
          status: pickFirstString(row, ['status'], 'Sem status'),
          marcoAtual: pickFirstString(row, ['marco_atual', 'marcoAtual'], 'Marco atual não informado'),
          lider: liderNome,
          detalhes: pickFirstString(row, ['detalhes', 'descricao', 'resumo'], 'Sem detalhes cadastrados.'),
          linkGrupo: pickFirstString(row, ['link_grupo', 'linkGrupo'], ''),
          lider_id: liderId || null,
          associados: associadoByJoin
            ? {
                nome_social: associadoByJoin.nome_social ?? null,
                nome_completo: associadoByJoin.nome_completo ?? null,
                foto_url: associadoByJoin.foto_url ?? null,
              }
            : null,
        };
      });

      if (parsedProjetos.length === 0) {
        console.warn('Nenhum projeto foi retornado pela tabela projetos.');
      }

      setProjetos(parsedProjetos);
    } catch (err) {
      console.error('Falha inesperada ao carregar projetos:', err);
      setProjetos([]);
    } finally {
      setIsLoadingProjetos(false);
    }
  }, []);

  useEffect(() => {
    void loadProjetos();
  }, [loadProjetos]);

  const filteredProjetos = useMemo(() => {
    if (selectedAvenida === 'TODAS') {
      return projetos;
    }

    const selectedCategoryNormalized = normalizeText(selectedAvenida);
    return projetos.filter((projeto) => normalizeText(projeto.avenida) === selectedCategoryNormalized);
  }, [projetos, selectedAvenida]);

  const statusOrder = useMemo(() => {
    const dynamicStatuses = Array.from(new Set(filteredProjetos.map((projeto) => projeto.status))).filter(
      (status) => status.trim().length > 0
    );
    const alreadyIncluded = new Set(STATUS_DISPLAY_ORDER.map(normalizeText));
    const extras = dynamicStatuses.filter((status) => !alreadyIncluded.has(normalizeText(status)));
    return [...STATUS_DISPLAY_ORDER, ...extras];
  }, [filteredProjetos]);

  const groupedByStatus = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      projetos: filteredProjetos.filter((projeto) => normalizeText(projeto.status) === normalizeText(status)),
    }));
  }, [filteredProjetos, statusOrder]);

  const handleOpenAddProject = () => {
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
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Projetos</h1>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-[12px] bg-brand-surface border border-brand-border flex items-center justify-center text-text-muted hover:text-text-main transition-colors">
                <Filter size={18} />
              </button>
              <button
                onClick={handleOpenAddProject}
                className={`w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors ${
                  isGuest
                    ? 'bg-brand-surface border border-brand-border text-text-muted'
                    : 'bg-cranberry text-on-cranberry hover:bg-cranberry-dark'
                }`}
                aria-label={isGuest ? 'Ação indisponível para convidado' : 'Novo projeto'}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Filtros de Avenida Horizontal (Scrollable) */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {avenidas.map((avenida) => (
              <button
                key={avenida}
                onClick={() => setSelectedAvenida(avenida)}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  selectedAvenida === avenida 
                    ? 'bg-cranberry text-on-cranberry border-cranberry' 
                    : 'bg-brand-surface border-brand-border text-text-muted hover:bg-brand-surface-raised'
                }`}
              >
                {avenida}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md md:max-w-7xl md:px-12 mx-auto w-full flex flex-col gap-8">
        {isLoadingProjetos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-brand-surface border border-brand-border rounded-[12px] p-4 animate-pulse">
                <div className="h-4 w-1/3 bg-brand-bg rounded mb-4" />
                <div className="h-5 w-3/4 bg-brand-bg rounded mb-2" />
                <div className="h-4 w-1/2 bg-brand-bg rounded" />
              </div>
            ))}
          </div>
        )}

        {!isLoadingProjetos &&
          groupedByStatus.map((group) => (
            <section key={group.status} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-text-muted">{group.status}</h2>
                <span className="text-xs text-text-muted">{group.projetos.length}</span>
              </div>

              {group.projetos.length === 0 && (
                <div className="bg-brand-surface border border-dashed border-brand-border rounded-[12px] px-4 py-6">
                  <p className="text-sm text-text-muted">Nenhum projeto neste status.</p>
                </div>
              )}

              {group.projetos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                  {group.projetos.map((projeto) => {
                    const isInProgress = normalizeText(projeto.status) === normalizeText('Em Andamento');

                    return (
                      <div
                        key={projeto.id}
                        className="bg-brand-surface border border-brand-border rounded-[12px] transition-all duration-200 overflow-hidden cursor-pointer hover:border-cranberry hover:ring-1 hover:ring-cranberry active:scale-[0.98]"
                        onClick={() => setSelectedProjeto(projeto)}
                      >
                        <div className="p-4 flex gap-4">
                          <div className="w-12 h-12 rounded-[12px] bg-brand-surface-raised border border-brand-border flex items-center justify-center shrink-0">
                            <Star size={20} className={isInProgress ? 'text-cranberry' : 'text-text-muted'} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5 truncate">
                              {projeto.avenida}
                            </p>
                            <h3 className="font-semibold text-text-main leading-tight mb-2 truncate">{projeto.nome}</h3>
                            <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                              <CirclePlay size={12} className={isInProgress ? 'text-cranberry' : 'text-text-muted'} />
                              <span>{projeto.status}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-text-muted">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

        {!isLoadingProjetos && filteredProjetos.length === 0 && (
          <div className="text-center py-4 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-text-muted">Nenhum projeto encontrado para esta categoria.</p>
          </div>
        )}
      </main>

      {showAddForm && !isGuest && (
        <AddProjetoForm
          onClose={() => setShowAddForm(false)}
          onCreated={loadProjetos}
        />
      )}
      {selectedProjeto && (
        <DetalhesProjeto
          projeto={selectedProjeto}
          onClose={() => setSelectedProjeto(null)}
          isGuest={isGuest}
          onGuestBlockedAction={onGuestBlockedAction}
          onUpdated={async (projetoAtualizado) => {
            setSelectedProjeto(projetoAtualizado);
            await loadProjetos();
          }}
        />
      )}
    </div>
  );
}
