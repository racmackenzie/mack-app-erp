import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AddProjetoFormProps {
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
}

type AssociadoOption = {
  id: string;
  nome_social: string | null;
  nome_completo: string | null;
};

const getAssociateDisplayName = (associado: AssociadoOption): string => {
  if (associado.nome_social && associado.nome_social.trim().length > 0) {
    return associado.nome_social.trim();
  }
  if (associado.nome_completo && associado.nome_completo.trim().length > 0) {
    return associado.nome_completo.trim();
  }
  return associado.id;
};

export function AddProjetoForm({ onClose, onCreated }: AddProjetoFormProps) {
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [avenida, setAvenida] = useState('');
  const [liderId, setLiderId] = useState('');
  const [status, setStatus] = useState('');
  const [marcoAtual, setMarcoAtual] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [linkGrupo, setLinkGrupo] = useState('');
  const [associados, setAssociados] = useState<AssociadoOption[]>([]);
  const [isLoadingAssociados, setIsLoadingAssociados] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAssociados = async () => {
      try {
        const [associadosResult, sessionResult] = await Promise.all([
          supabase.from('associados').select('id, nome_social, nome_completo').order('nome_social', { ascending: true }),
          supabase.auth.getSession(),
        ]);

        const { data, error } = associadosResult;
        const sessionUserId = sessionResult.data.session?.user?.id ?? '';

        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Erro ao carregar associados para seleção de líder:', error);
          setAssociados([]);
          return;
        }

        setAssociados((data ?? []) as AssociadoOption[]);
        if (sessionUserId) {
          setLiderId((current) => current || sessionUserId);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error('Falha inesperada ao buscar associados:', error);
        setAssociados([]);
      } finally {
        if (!isMounted) {
          return;
        }
        setIsLoadingAssociados(false);
      }
    };

    void loadAssociados();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setNomeProjeto('');
    setAvenida('');
    setLiderId('');
    setStatus('');
    setMarcoAtual('');
    setDetalhes('');
    setLinkGrupo('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = {
        nome_projeto: nomeProjeto.trim(),
        avenida: avenida,
        status: status || 'Planejamento',
        marco_atual: marcoAtual?.trim() || null,
        detalhes: detalhes?.trim() || null,
        link_grupo: linkGrupo?.trim() || null,
        lider_id: liderId?.trim() || (session?.user?.id ?? null),
      };

      console.log('Payload enviando para projetos:', payload);

      const { data, error } = await supabase.from('projetos').insert([payload]).select();

      if (error) {
        alert('Erro ao criar projeto: ' + error.message);
        console.error(error);
        return;
      }

      console.log('Projeto criado com sucesso:', data);
      resetForm();
      await onCreated?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado ao criar projeto';
      alert('Erro ao criar projeto: ' + message);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avenidas = [
    'Desenvolvimento de Quadro Associativo',
    'Captação de Recursos',
    'Comunitários',
    'Meio Ambiente',
    'Internacionais',
    'Imagem Pública',
    'Profissionais',
    'Ação'
  ];

  const statusOptions = ['Planejamento', 'Em Ação', 'Finalizado'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-full md:max-w-3xl md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
        <h2 className="font-bold text-lg text-text-main">Novo Projeto</h2>
        <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <form id="add-projeto-form" onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={nomeProjeto}
              onChange={(e) => setNomeProjeto(e.target.value)}
              placeholder="Ex: Campanha do Agasalho"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
            >
              <option value="">Selecione o Status (opcional)</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Avenida de Ação
            </label>
            <select
              value={avenida}
              onChange={(e) => setAvenida(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
              required
            >
              <option value="" disabled>Selecione a Avenida</option>
              {avenidas.map((av) => (
                <option key={av} value={av}>{av}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Marco Atual
            </label>
            <input
              type="text"
              value={marcoAtual}
              onChange={(e) => setMarcoAtual(e.target.value)}
              placeholder="Ex: Arrecadação iniciada"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Líder do Projeto
            </label>
            <select
              value={liderId}
              onChange={(e) => setLiderId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
              disabled={isLoadingAssociados}
            >
              <option value="">
                {isLoadingAssociados ? 'Carregando associados...' : 'Selecione um líder (opcional)'}
              </option>
              {associados.map((associado) => (
                <option key={associado.id} value={associado.id}>
                  {getAssociateDisplayName(associado)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Link do Grupo de WhatsApp
            </label>
            <input
              type="url"
              value={linkGrupo}
              onChange={(e) => setLinkGrupo(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Detalhes / Resumo
            </label>
            <textarea
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Descreva o objetivo e detalhes do projeto..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all min-h-[120px] resize-none"
            />
          </div>

          <div className="col-span-1 md:col-span-2 pt-1">
            <button
              type="submit"
              form="add-projeto-form"
              disabled={isSubmitting}
              className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center hover:bg-cranberry-dark active:scale-[0.98] transition-all"
            >
              {isSubmitting ? 'Criando...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </main>
      </div>
    </div>
  );
}
