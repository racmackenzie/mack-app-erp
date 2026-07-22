import { useState } from 'react';
import { Filter, Star, CirclePlay, ChevronRight, Plus } from 'lucide-react';
import { AddProjetoForm } from '../components/AddProjetoForm';
import { DetalhesProjeto } from '../components/DetalhesProjeto';

interface ProjetosProps {
  isGuest?: boolean;
  onGuestBlockedAction?: () => void;
}

export function Projetos({ isGuest = false, onGuestBlockedAction }: ProjetosProps) {
  const [selectedAvenida, setSelectedAvenida] = useState<string>('Todas');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<any | null>(null);

  const avenidas = [
    'Todas',
    'Comunitários',
    'Profissionais',
    'Imagem Pública',
    'Desenvolvimento de Quadro',
  ];

  const projetos = [
    {
      id: 1,
      nome: 'Campanha do Agasalho 2024',
      avenida: 'Comunitários',
      status: 'Em Andamento',
      marcoAtual: 'Arrecadação na Universidade',
      lider: 'João Silva',
      detalhes: 'Meta de arrecadação de 500 peças de roupas para doação em abrigos parceiros da região central.',
    },
    {
      id: 2,
      nome: 'Mentoria Carreira Mackenzista',
      avenida: 'Profissionais',
      status: 'Planejamento',
      marcoAtual: 'Captação de Palestrantes',
      lider: 'Ana Flávia',
      detalhes: 'Ciclo de palestras com ex-alunos de destaque para orientar os atuais membros do clube.',
    },
    {
      id: 3,
      nome: 'Rebranding Redes Sociais',
      avenida: 'Imagem Pública',
      status: 'Concluído',
      marcoAtual: 'Lançamento do Novo Instagram',
      lider: 'Mariana Lima',
      detalhes: 'Adequação da identidade visual do clube aos novos padrões da Rotaract Brasil.',
    },
  ];

  const filteredProjetos = selectedAvenida === 'Todas' 
    ? projetos 
    : projetos.filter(p => p.avenida === selectedAvenida);

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

      <main className="px-4 py-6 max-w-md md:max-w-7xl md:px-12 mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
        {filteredProjetos.map((projeto) => {
          return (
            <div 
              key={projeto.id} 
              className="bg-brand-surface border border-brand-border rounded-[12px] transition-all duration-200 overflow-hidden cursor-pointer hover:border-cranberry hover:ring-1 hover:ring-cranberry active:scale-[0.98]"
              onClick={() => setSelectedProjeto(projeto)}
            >
              {/* Card Header */}
              <div className="p-4 flex gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-brand-surface-raised border border-brand-border flex items-center justify-center shrink-0">
                  <Star size={20} className={projeto.status === 'Em Andamento' ? 'text-cranberry' : 'text-text-muted'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-0.5 truncate">
                    {projeto.avenida}
                  </p>
                  <h3 className="font-semibold text-text-main leading-tight mb-2 truncate">
                    {projeto.nome}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[12px] text-text-muted">
                    <CirclePlay size={12} className={projeto.status === 'Em Andamento' ? 'text-cranberry' : 'text-text-muted'} />
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

        {filteredProjetos.length === 0 && (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-text-muted">Nenhum projeto encontrado nesta avenida.</p>
          </div>
        )}
      </main>

      {showAddForm && !isGuest && <AddProjetoForm onClose={() => setShowAddForm(false)} />}
      {selectedProjeto && (
        <DetalhesProjeto
          projeto={selectedProjeto}
          onClose={() => setSelectedProjeto(null)}
          isGuest={isGuest}
          onGuestBlockedAction={onGuestBlockedAction}
        />
      )}
    </div>
  );
}
