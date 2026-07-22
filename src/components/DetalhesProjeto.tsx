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

interface Projeto {
  id: string | number;
  nome: string;
  avenida: string;
  status: string;
  marcoAtual: string;
  lider: string;
  detalhes: string;
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
}

export function DetalhesProjeto({
  projeto,
  onClose,
  isGuest = false,
  onGuestBlockedAction,
}: DetalhesProjetoProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingComentarios, setIsLoadingComentarios] = useState(true);

  const canComment = useMemo(() => !isGuest && Boolean(session?.user?.id), [isGuest, session]);
  const nomeLiderProjeto =
    projeto.associados?.nome_social || projeto.associados?.nome_completo || 'Liderança não definida';

  const fetchComentarios = useCallback(async () => {
    setIsLoadingComentarios(true);

    console.log('ID do projeto aberto:', projeto.id);

    const { data, error } = await supabase
      .from('comentarios_projetos')
      .select('*, associados:autor_id (nome_social, nome_completo, foto_url)')
      .eq('projeto_id', projeto.id)
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
  }, [projeto.id]);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Erro ao recuperar sessão atual:', error);
      }

      if (isMounted) {
        setSession(data.session ?? null);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void fetchComentarios();
  }, [fetchComentarios]);

  const handleEnviarComentario = async (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e?.preventDefault();

    if (!novoComentario.trim()) return;
    if (!session?.user?.id) return;
    const projetoIdAtual = projeto.id;

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
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center gap-3 bg-brand-surface shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-text-main truncate">{projeto.nome}</h2>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="p-4 flex flex-col gap-6 max-w-md mx-auto">
          {/* Info Block */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-brand-surface-raised border border-brand-border text-[10px] font-bold uppercase tracking-widest text-text-muted">
                {projeto.avenida}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-cranberry/10 border border-cranberry/20 text-[10px] font-bold uppercase tracking-widest text-cranberry">
                {projeto.status}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-text-main leading-tight mb-4">{projeto.nome}</h1>
              
              <div className="flex flex-col gap-3 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                    Líder do Projeto
                  </span>
                  <div className="flex items-center gap-2 text-sm text-text-main font-medium">
                    {projeto.associados?.foto_url ? (
                      <img
                        src={projeto.associados.foto_url}
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
                  <p className="text-sm text-text-main">{projeto.marcoAtual}</p>
                </div>

                <div className="w-full h-px bg-brand-border"></div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">
                    Detalhes
                  </span>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {projeto.detalhes}
                  </p>
                </div>
              </div>
            </div>

            <button className="w-full bg-brand-surface border border-brand-border text-text-main h-12 rounded-[12px] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-surface-raised transition-colors mt-2">
              <LinkIcon size={18} />
              Acessar Grupo de WhatsApp
            </button>
          </section>

          {/* Comentários */}
          <section className="flex flex-col gap-4 mt-2">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <MessageSquare size={18} className="text-cranberry" />
              Linha do Tempo e Atas
            </h3>

            <div className="flex flex-col gap-3">
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
                  <div key={item.id} className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex gap-3">
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

            {/* Input Comentário */}
            <form onSubmit={handleEnviarComentario} className="flex gap-2 mt-2 sticky bottom-4">
              <input
                type="text"
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                onFocus={() => {
                  if (!session?.user) {
                    onGuestBlockedAction?.();
                  }
                }}
                placeholder={canComment ? 'Adicionar atualização ou ata...' : 'Faça login para comentar'}
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
            {!canComment && (
              <p className="text-[12px] text-text-muted">
                Convidados podem visualizar o histórico, mas não podem criar comentários.
              </p>
            )}
          </section>
        </div>
      </main>
      </div>
    </div>
  );
}
