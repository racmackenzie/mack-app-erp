import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Link as LinkIcon, User } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface Comentario {
  id: string;
  created_at?: string | null;
  data_comentario?: string | null;
  comentario?: string | null;
  texto?: string | null;
  titulo?: string | null;
  autor_id?: string | null;
  autor_nome?: string | null;
  associados?: {
    nome_social: string | null;
    nome_completo: string | null;
    foto_url: string | null;
  } | null;
}

interface AssociadoResumo {
  id: string;
  nome_social: string | null;
  nome_completo: string | null;
  foto_url: string | null;
}

interface UserProfile {
  role?: string | null;
  cargo?: string | null;
}

interface Projeto {
  id: string | number;
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
}

interface DetalhesProjetoProps {
  projeto: Projeto;
  onClose: () => void;
  isGuest?: boolean;
  onGuestBlockedAction?: () => void;
  onGoToLogin?: () => void;
  onUpdated?: (projetoAtualizado: Projeto) => Promise<void> | void;
}

export function DetalhesProjeto({
  projeto,
  onClose,
  isGuest = false,
  onGuestBlockedAction,
  onGoToLogin,
  onUpdated,
}: DetalhesProjetoProps) {
  const [projetoAtual, setProjetoAtual] = useState<Projeto>(projeto);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [associados, setAssociados] = useState<AssociadoResumo[]>([]);
  const [isLoadingComentarios, setIsLoadingComentarios] = useState(true);
  const [isLoadingAssociados, setIsLoadingAssociados] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [isSavingProjeto, setIsSavingProjeto] = useState(false);

  const [editNomeProjeto, setEditNomeProjeto] = useState(projeto.nome);
  const [editAvenida, setEditAvenida] = useState(projeto.avenida);
  const [editLiderId, setEditLiderId] = useState(projeto.lider_id ?? '');
  const [editStatus, setEditStatus] = useState(projeto.status);
  const [editMarcoAtual, setEditMarcoAtual] = useState(projeto.marcoAtual);
  const [editDetalhes, setEditDetalhes] = useState(projeto.detalhes);
  const [editLinkGrupo, setEditLinkGrupo] = useState(projeto.linkGrupo ?? '');

  const estaLogado = !!session?.user;
  const canComment = useMemo(() => !isGuest && estaLogado, [estaLogado, isGuest]);
  const ehLider = projetoAtual?.lider_id === session?.user?.id;
  const ehConselho =
    userProfile?.role === 'conselho' ||
    (userProfile?.cargo?.toLowerCase().includes('conselho') ?? false);
  const podeEditar = ehLider || ehConselho;

  const avenidas = [
    'Desenvolvimento de Quadro Associativo',
    'Captação de Recursos',
    'Comunitários',
    'Meio Ambiente',
    'Internacionais',
    'Imagem Pública',
    'Profissionais',
    'Ação',
  ];
  const statusOptions = ['Planejamento', 'Em Ação', 'Finalizado'];
  const nomeLiderProjeto =
    projetoAtual.associados?.nome_social ||
    projetoAtual.associados?.nome_completo ||
    projetoAtual.lider ||
    'Liderança não definida';

  const getAssociateDisplayName = useCallback((associado: AssociadoResumo): string => {
    if (associado.nome_social && associado.nome_social.trim().length > 0) {
      return associado.nome_social.trim();
    }
    if (associado.nome_completo && associado.nome_completo.trim().length > 0) {
      return associado.nome_completo.trim();
    }
    return associado.id;
  }, []);

  const preencherCamposEdicao = useCallback(
    (source: Projeto) => {
      setEditNomeProjeto(source.nome);
      setEditAvenida(source.avenida);
      setEditLiderId(source.lider_id ?? '');
      setEditStatus(source.status);
      setEditMarcoAtual(source.marcoAtual);
      setEditDetalhes(source.detalhes);
      setEditLinkGrupo(source.linkGrupo ?? '');
    },
    []
  );

  useEffect(() => {
    setProjetoAtual(projeto);
    preencherCamposEdicao(projeto);
  }, [preencherCamposEdicao, projeto]);

  const fetchComentarios = useCallback(async () => {
    if (!session?.user) {
      setComentarios([]);
      setIsLoadingComentarios(false);
      return;
    }

    setIsLoadingComentarios(true);

    console.log('ID do projeto aberto:', projetoAtual.id);

    const { data, error } = await supabase
      .from('comentarios_projetos')
      .select('*, associados:autor_id (nome_social, nome_completo, foto_url)')
      .eq('projeto_id', projetoAtual.id)
      .order('data_comentario', { ascending: true });

    console.log('Comentários encontrados:', data);
    console.log('Erro na busca de comentários:', error);

    if (error) {
      console.error('Erro ao buscar comentários do projeto:', error);
      setComentarios([]);
      setIsLoadingComentarios(false);
      return;
    }

    const rows = (data ?? []) as Comentario[];
    const missingAutorIds = Array.from(
      new Set(rows.filter((item) => !item.associados?.foto_url && item.autor_id).map((item) => item.autor_id as string))
    );

    if (missingAutorIds.length === 0) {
      setComentarios(rows);
      setIsLoadingComentarios(false);
      return;
    }

    const { data: associadosRows, error: associadosError } = await supabase
      .from('associados')
      .select('id, nome_social, nome_completo, foto_url')
      .in('id', missingAutorIds);

    if (associadosError) {
      console.error('Erro ao buscar fotos dos autores:', associadosError);
      setComentarios(rows);
      setIsLoadingComentarios(false);
      return;
    }

    const associadosMap = new Map<string, AssociadoResumo>();
    ((associadosRows ?? []) as AssociadoResumo[]).forEach((associado) => {
      associadosMap.set(associado.id, associado);
    });

    const mergedComentarios = rows.map((item) => {
      if (item.associados?.foto_url || !item.autor_id) {
        return item;
      }

      const associado = associadosMap.get(item.autor_id);
      if (!associado) {
        return item;
      }

      return {
        ...item,
        associados: {
          nome_social: associado.nome_social,
          nome_completo: associado.nome_completo,
          foto_url: associado.foto_url,
        },
      };
    });

    setComentarios(mergedComentarios);
    setIsLoadingComentarios(false);
  }, [projetoAtual.id, session]);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao recuperar sessão atual:', error);
      }

      if (isMounted) {
        setSession(data.session ?? null);
        setSessionLoaded(true);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionLoaded(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionLoaded) {
      return;
    }

    void fetchComentarios();
  }, [fetchComentarios, sessionLoaded]);

  useEffect(() => {
    let isMounted = true;

    const loadPermissionData = async () => {
      if (!session?.user?.id) {
        if (isMounted) {
          setUserProfile(null);
          setAssociados([]);
          setIsLoadingAssociados(false);
        }
        return;
      }

      setIsLoadingAssociados(true);
      const [profileResult, associadosResult] = await Promise.all([
        supabase.from('associados').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('associados').select('id, nome_social, nome_completo, foto_url').order('nome_social', { ascending: true }),
      ]);

      if (!isMounted) {
        return;
      }

      if (profileResult.error) {
        console.error('Erro ao carregar perfil para permissão de edição de projeto:', profileResult.error);
        setUserProfile(null);
      } else {
        const profileData = (profileResult.data as Record<string, unknown> | null) ?? null;
        setUserProfile({
          role: typeof profileData?.role === 'string' ? profileData.role : null,
          cargo: typeof profileData?.cargo === 'string' ? profileData.cargo : null,
        });
      }

      if (associadosResult.error) {
        console.error('Erro ao carregar associados para edição de projeto:', associadosResult.error);
        setAssociados([]);
      } else {
        setAssociados((associadosResult.data ?? []) as AssociadoResumo[]);
      }

      setEditLiderId((current) => current || projetoAtual.lider_id || session.user.id);

      setIsLoadingAssociados(false);
    };

    void loadPermissionData();

    return () => {
      isMounted = false;
    };
  }, [projetoAtual.lider_id, session?.user?.id]);

  const handleSalvarProjeto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!podeEditar || isSavingProjeto) {
      return;
    }

    if (!editNomeProjeto.trim() || !editAvenida.trim()) {
      alert('Nome do Projeto e Avenida de Ação são obrigatórios.');
      return;
    }

    setIsSavingProjeto(true);

    try {
      const liderSelecionado = editLiderId?.trim();
      const payload = {
        nome_projeto: editNomeProjeto.trim(),
        avenida: editAvenida,
        status: editStatus?.trim() || 'Planejamento',
        marco_atual: editMarcoAtual?.trim() || null,
        detalhes: editDetalhes?.trim() || null,
        link_grupo: editLinkGrupo?.trim() || null,
        lider_id: liderSelecionado || session?.user?.id || null,
      };

      const { error } = await supabase.from('projetos').update(payload).eq('id', projetoAtual.id);

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        alert('Erro ao salvar projeto: ' + error.message);
        return;
      }

      const associadoSelecionado = associados.find((associado) => associado.id === (payload.lider_id ?? ''));
      const projetoAtualizado: Projeto = {
        ...projetoAtual,
        nome: payload.nome_projeto,
        avenida: payload.avenida,
        status: payload.status,
        marcoAtual: payload.marco_atual || 'Marco atual não informado',
        detalhes: payload.detalhes || 'Sem detalhes cadastrados.',
        linkGrupo: payload.link_grupo,
        lider_id: payload.lider_id,
        lider: associadoSelecionado ? getAssociateDisplayName(associadoSelecionado) : projetoAtual.lider,
        associados: associadoSelecionado
          ? {
              nome_social: associadoSelecionado.nome_social,
              nome_completo: associadoSelecionado.nome_completo,
              foto_url: associadoSelecionado.foto_url,
            }
          : projetoAtual.associados ?? null,
      };

      setProjetoAtual(projetoAtualizado);
      setModoEdicao(false);
      preencherCamposEdicao(projetoAtualizado);
      await onUpdated?.(projetoAtualizado);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao atualizar projeto';
      console.error('Falha ao salvar edição de projeto:', error);
      alert('Erro ao salvar projeto: ' + message);
    } finally {
      setIsSavingProjeto(false);
    }
  };

  const handleEnviarComentario = async (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();

    if (!novoComentario.trim()) return;
    if (!session?.user?.id) return;
    const projetoIdAtual = projetoAtual.id;

    const payload = {
      projeto_id: projetoIdAtual,
      autor_id: session?.user?.id,
      comentario: novoComentario.trim(),
      titulo: 'Atualização',
    };

    console.log('Enviando comentário:', payload);

    const { error } = await supabase
      .from('comentarios_projetos')
      .insert([payload])
      .select();

    if (error) {
      console.error('Erro no Supabase ao comentar:', error);
      alert('Erro ao enviar comentário: ' + error.message);
      return;
    }

    await fetchComentarios();
    setNovoComentario('');
  };

  const getAuthorName = (item: Comentario) =>
    item.associados?.nome_social || item.associados?.nome_completo || 'Associado';

  const getAuthorAvatar = (item: Comentario) =>
    item.associados?.foto_url ||
    `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(getAuthorName(item))}&backgroundColor=ffb2be`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-full md:max-w-5xl md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        <main className="flex-1 overflow-y-auto md:overflow-hidden pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
          <div className="p-4 md:p-6 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start md:h-full">
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1 p-2 -ml-2 text-text-muted hover:text-text-main transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span className="text-sm font-semibold">Voltar</span>
                </button>
                <div className="flex flex-wrap justify-end gap-2">
                  {podeEditar && (
                    <button
                      onClick={() => {
                        preencherCamposEdicao(projetoAtual);
                        setModoEdicao(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ✏️ Editar Projeto
                    </button>
                  )}
                  <span className="px-2.5 py-1 rounded-full bg-brand-surface-raised border border-brand-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {projetoAtual.avenida}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-cranberry/10 border border-cranberry/20 text-[10px] font-bold uppercase tracking-widest text-cranberry">
                    {projetoAtual.status}
                  </span>
                </div>
              </div>

              {modoEdicao ? (
                <form onSubmit={handleSalvarProjeto} className="flex flex-col gap-4 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Nome do Projeto</label>
                    <input
                      type="text"
                      value={editNomeProjeto}
                      onChange={(e) => setEditNomeProjeto(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Avenida de Ação</label>
                    <select
                      value={editAvenida}
                      onChange={(e) => setEditAvenida(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
                      required
                    >
                      <option value="" disabled>Selecione a Avenida</option>
                      {avenidas.map((avenida) => (
                        <option key={avenida} value={avenida}>{avenida}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Líder do Projeto</label>
                    <select
                      value={editLiderId}
                      onChange={(e) => setEditLiderId(e.target.value)}
                      disabled={isLoadingAssociados}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none disabled:opacity-70"
                    >
                      <option value="">
                        {isLoadingAssociados ? 'Carregando associados...' : 'Selecionar líder (opcional)'}
                      </option>
                      {associados.map((associado) => (
                        <option key={associado.id} value={associado.id}>
                          {getAssociateDisplayName(associado)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
                    >
                      <option value="">Selecione o Status (opcional)</option>
                      {statusOptions.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>{statusOption}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Marco Atual</label>
                    <input
                      type="text"
                      value={editMarcoAtual}
                      onChange={(e) => setEditMarcoAtual(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Link do Grupo de WhatsApp</label>
                    <input
                      type="url"
                      value={editLinkGrupo}
                      onChange={(e) => setEditLinkGrupo(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] h-11 px-3 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Detalhes</label>
                    <textarea
                      value={editDetalhes}
                      onChange={(e) => setEditDetalhes(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-[12px] min-h-[90px] p-3 text-text-main resize-none focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setModoEdicao(false);
                        preencherCamposEdicao(projetoAtual);
                      }}
                      className="flex-1 h-11 border border-brand-border text-text-main rounded-[12px] font-semibold text-sm hover:bg-brand-surface-raised transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProjeto}
                      className="flex-1 h-11 bg-cranberry text-on-cranberry rounded-[12px] font-semibold text-sm hover:bg-cranberry-dark transition-colors disabled:opacity-60"
                    >
                      {isSavingProjeto ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-text-main leading-tight">{projetoAtual.nome}</h1>

                  <div className="flex flex-col gap-3 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                        Líder do Projeto
                      </span>
                      <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                        {projetoAtual.associados?.foto_url ? (
                          <img
                            src={projetoAtual.associados.foto_url}
                            alt={nomeLiderProjeto}
                            className="w-6 h-6 rounded-full object-cover border border-brand-border"
                          />
                        ) : (
                          <User size={16} className="text-text-muted" />
                        )}
                        {nomeLiderProjeto}
                      </div>
                    </div>

                    <div className="w-full h-px bg-brand-border"></div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                        Marco Atual
                      </span>
                      <p className="text-sm text-text-main">{projetoAtual.marcoAtual}</p>
                    </div>

                    <div className="w-full h-px bg-brand-border"></div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                        Detalhes
                      </span>
                      <p className="text-sm text-text-muted leading-relaxed">{projetoAtual.detalhes}</p>
                    </div>
                  </div>

                  <a
                    href={projetoAtual.linkGrupo?.trim() || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-brand-surface border border-brand-border text-text-main h-12 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-surface-raised transition-colors"
                    onClick={(event) => {
                      if (!projetoAtual.linkGrupo?.trim()) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <LinkIcon size={18} />
                    Acessar Grupo de WhatsApp
                  </a>
                </>
              )}
            </section>

            <section className="flex flex-col gap-4 md:h-full md:min-h-0">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <MessageSquare size={18} className="text-cranberry" />
                Linha do Tempo e Atas
              </h3>

              {estaLogado ? (
                <>
                  <div className="flex flex-col gap-3 md:flex-1 md:min-h-0 md:max-h-[400px] md:overflow-y-auto md:pr-1">
                    {isLoadingComentarios && (
                      <div className="p-4 bg-brand-surface rounded-[12px] border border-brand-border">
                        <p className="text-sm text-text-muted">Carregando comentários...</p>
                      </div>
                    )}

                    {!isLoadingComentarios && comentarios.length === 0 && (
                      <div className="p-4 bg-brand-surface rounded-[12px] border border-brand-border">
                        <p className="text-sm text-text-muted">Nenhum comentário ainda.</p>
                      </div>
                    )}

                    {!isLoadingComentarios &&
                      comentarios.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex gap-3"
                        >
                          <img
                            src={getAuthorAvatar(item)}
                            alt={getAuthorName(item)}
                            className="w-10 h-10 rounded-full bg-brand-surface-raised border border-brand-border shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-text-main text-sm">
                                {item.associados?.nome_social || item.associados?.nome_completo || 'Associado'}
                              </span>
                              <span className="text-[10px] text-text-muted">
                                {item.data_comentario
                                  ? new Date(item.data_comentario).toLocaleDateString('pt-BR', {
                                      timeZone: 'America/Sao_Paulo',
                                    })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-sm text-text-muted whitespace-pre-wrap">{item.comentario}</p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="md:mt-auto md:pt-2 md:bg-brand-bg">
                    <form onSubmit={handleEnviarComentario} className="flex gap-2">
                      <input
                        type="text"
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Adicionar atualização ou ata..."
                        disabled={!canComment}
                        className="flex-1 bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                      />
                      <button
                        type="submit"
                        onClick={handleEnviarComentario}
                        disabled={!canComment || !novoComentario.trim()}
                        className="w-12 h-12 shrink-0 bg-cranberry text-on-cranberry rounded-[12px] flex items-center justify-center disabled:opacity-50 transition-colors"
                      >
                        <Send size={18} className="ml-1" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-center h-full md:min-h-[400px]">
                  <span className="text-3xl mb-2">🔒</span>
                  <h4 className="font-semibold text-gray-800 text-sm">Conteúdo Restrito</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    A linha do tempo e as atas do projeto são visíveis apenas para membros do clube.
                  </p>
                  <button
                    type="button"
                    onClick={() => onGoToLogin?.()}
                    className="mt-4 px-4 h-10 rounded-[12px] bg-brand-surface border border-brand-border text-text-main text-sm font-semibold hover:bg-brand-surface-raised transition-colors"
                  >
                    Fazer login
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
