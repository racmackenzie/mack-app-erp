import { useState } from 'react';
import { Search, Mail, Phone, ShieldAlert, User } from 'lucide-react';
import { DetalhesMembro } from '../components/DetalhesMembro';

interface AssociadosProps {
  initialIsGuest: boolean;
}

export function Associados({ initialIsGuest }: AssociadosProps) {
  const isGuestView = initialIsGuest;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembro, setSelectedMembro] = useState<any | null>(null);

  const membros = [
    {
      id: 1,
      nome: 'Ana Flávia',
      nomeSocial: 'Ana',
      cargo: 'Presidente 23-24',
      profissao: 'Engenheira de Software',
      email: 'ana.flavia@mackenzie.br',
      whatsapp: '+55 11 99999-9999',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ana&backgroundColor=ffb2be',
      sobre: 'Entusiasta de tecnologia e impacto social. Acredito que o Rotaract é o melhor lugar para desenvolver liderança na prática.',
    },
    {
      id: 2,
      nome: 'Carlos Eduardo',
      nomeSocial: 'Cadu',
      cargo: 'Diretor de Projetos',
      profissao: 'Estudante de Administração',
      email: 'carlos.edu@mackenzie.br',
      whatsapp: '+55 11 98888-8888',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Carlos&backgroundColor=d91b5c',
    },
    {
      id: 3,
      nome: 'Mariana Lima',
      nomeSocial: 'Mari',
      cargo: 'Associada Representativa',
      profissao: 'Designer Gráfico',
      email: 'mariana.lima@mackenzie.br',
      whatsapp: '+55 11 97777-7777',
      avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Mariana&backgroundColor=2d2d2d',
    },
  ];

  const filteredMembros = membros.filter(m => 
    m.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.cargo.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <img src={membro.avatar} alt={membro.nome} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text-main truncate text-base leading-tight">
                {membro.nome}
              </h3>
              <p className="text-[12px] text-text-muted mt-0.5 truncate">{membro.cargo}</p>
              
              <div className="mt-4 flex flex-col gap-2">
                {isGuestView ? (
                  <div className="flex items-center gap-2 text-[12px] text-text-muted bg-brand-surface-raised px-3 py-2 rounded-[8px] border border-brand-border">
                    <ShieldAlert size={14} className="text-rotary-yellow" />
                    <span className="italic">Informações de contato restritas.</span>
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

        {filteredMembros.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <User size={32} className="text-brand-border" />
            <p className="text-sm text-text-muted">Nenhum associado encontrado.</p>
          </div>
        )}
      </main>

      {selectedMembro && <DetalhesMembro membro={selectedMembro} isGuestView={isGuestView} onClose={() => setSelectedMembro(null)} />}
    </div>
  );
}
