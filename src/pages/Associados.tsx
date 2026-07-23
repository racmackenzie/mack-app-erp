import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Search, Mail, Phone, ShieldAlert, User } from 'lucide-react';
import { DetalhesMembro } from '../components/DetalhesMembro';
import { supabase, supabasePublic } from '../lib/supabaseClient';

interface AssociadosProps {
  initialIsGuest: boolean;
  session?: Session | null;
}

type AssociadoRow = {
  id: string;
  ativo: boolean | null;
  foto_url: string | null;
  nome_social: string | null;
  nome_completo: string | null;
  cargo: string | null;
  profissao: string | null;
  email: string | null;
  telefone: string | null;
  celular: string | null;
  sobre_mim: string | null;
};

type MembroCard = {
  id: string;
  nomeCompleto: string;
  nomeSocial: string;
  nome: string;
  cargo: string;
  profissao: string;
  email: string;
  whatsapp: string;
  avatar: string;
  sobre: string;
};

const normalizeText = (value?: string | null): string => (value ?? '').toLowerCase().trim();

export function Associados({ initialIsGuest, session = null }: AssociadosProps) {
  const ehConvidado = !session?.user;
  const [searchQuery, setSearchQuery] = useState('');
  const [membros, setMembros] = useState<MembroCard[]>([]);
  const [selectedMembro, setSelectedMembro] = useState<MembroCard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadAssociadosAtivos = async () => {
      const supabaseClient = session?.user ? supabase : supabasePublic;
      const { data, error } = await supabaseClient
        .from('associados')
        .select('*')
        .eq('ativo', true)
        .order('nome_social', { ascending: true });

      if (!isActive) {
        return;
      }

      if (error) {
        console.error('Erro ao buscar associados:', error);
        setLoadError(
          error.code === '42501' || error.message.toLowerCase().includes('row-level security')
            ? 'Os associados nao puderam ser carregados com as permissoes atuais.'
            : 'Nao foi possivel carregar os associados.'
        );
        setMembros([]);
        return;
      }

      setLoadError(null);

      const membrosAtivos = ((data ?? []) as AssociadoRow[]).map((associado) => {
        const nomeSocial = associado.nome_social || '';
        const nomeCompleto = associado.nome_completo || '';
        const nomeBase = nomeSocial || nomeCompleto || 'Associado(a)';

        return {
          id: associado.id,
          nomeCompleto,
          nomeSocial: nomeSocial && nomeSocial !== nomeBase ? nomeSocial : '',
          nome: nomeBase,
          cargo: associado.cargo || 'Associado(a)',
          profissao: associado.profissao || 'Profissão não informada',
          email: associado.email || 'E-mail não informado',
          whatsapp: associado.telefone || associado.celular || 'Telefone não informado',
          avatar: associado.foto_url || '',
          sobre: associado.sobre_mim || '',
        };
      });

      setMembros(membrosAtivos);
    };

    void loadAssociadosAtivos();

    return () => {
      isActive = false;
    };
  }, [session]);

  const filteredMembros = useMemo(() => {
    const query = normalizeText(searchQuery);

    if (!query) {
      return membros;
    }

    return membros.filter((membro) =>
      normalizeText(membro.nomeSocial).includes(query) ||
      normalizeText(membro.nomeCompleto).includes(query) ||
      normalizeText(membro.cargo).includes(query)
    );
  }, [membros, searchQuery]);

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      <header className="px-4 pt-12 pb-4 bg-brand-surface-raised border-b border-brand-border sticky top-0 z-40">
        <div className="max-w-md md:max-w-7xl md:px-8 mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Associados</h1>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou cargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 pl-12 pr-4 text-text-main placeholder:text-text-muted text-sm focus:outline-none focus:border-cranberry transition-colors"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md md:max-w-7xl md:px-12 mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembros.map((membro) => (
          <div 
            key={membro.id} 
            className="bg-brand-surface border border-brand-border rounded-[12px] p-4 flex gap-4 cursor-pointer hover:border-cranberry hover:ring-1 hover:ring-cranberry active:scale-[0.98] transition-all"
            onClick={() => setSelectedMembro(membro)}
          >
            <div className="w-14 h-14 rounded-full bg-brand-bg border border-brand-border overflow-hidden shrink-0">
              {membro.avatar ? (
                <img src={membro.avatar} alt={membro.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <User size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-main truncate text-base leading-tight">
                {membro.nomeSocial || membro.nomeCompleto || 'Associado(a)'}
              </h3>
              <p className="text-[12px] text-text-muted mt-0.5 truncate">{membro.cargo}</p>
              
              <div className="mt-4 flex flex-col gap-2">
                {ehConvidado ? (
                  <div className="flex items-center gap-2 text-[12px] text-text-muted bg-brand-surface-raised px-3 py-2 rounded-[8px] border border-brand-border">
                    <ShieldAlert size={14} className="text-rotary-yellow" />
                    <span className="italic">Faça login para ver as informações de contato.</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[13px] text-text-main">
                      <Mail size={14} className="text-cranberry shrink-0" />
                      <span className="truncate">{membro.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-text-main">
                      <Phone size={14} className="text-cranberry shrink-0" />
                      <span>{membro.whatsapp}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {loadError && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <ShieldAlert size={32} className="text-rotary-yellow" />
            <p className="text-sm text-text-muted">{loadError}</p>
          </div>
        )}

        {!loadError && filteredMembros.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <User size={32} className="text-brand-border" />
            <p className="text-sm text-text-muted">Nenhum associado encontrado.</p>
          </div>
        )}
      </main>

      {selectedMembro && <DetalhesMembro membro={selectedMembro} isGuestView={ehConvidado} onClose={() => setSelectedMembro(null)} />}
    </div>
  );
}
