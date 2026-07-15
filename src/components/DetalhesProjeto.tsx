import { useState } from 'react';
import { ArrowLeft, MessageSquare, Send, Link as LinkIcon, User } from 'lucide-react';

interface Comentario {
  id: string;
  autor: string;
  foto: string;
  data: string;
  categoria: string;
  texto: string;
}

interface Projeto {
  id: number;
  nome: string;
  avenida: string;
  status: string;
  marcoAtual: string;
  lider: string;
  detalhes: string;
}

interface DetalhesProjetoProps {
  projeto: Projeto;
  onClose: () => void;
}

export function DetalhesProjeto({ projeto, onClose }: DetalhesProjetoProps) {
  const [comentarios, setComentarios] = useState<Comentario[]>([
    {
      id: '1',
      autor: 'Ana Flávia',
      foto: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ana&backgroundColor=ffb2be',
      data: 'Hoje, 14:30',
      categoria: 'Decisão',
      texto: 'Decidimos focar na arrecadação no prédio principal.',
    },
    {
      id: '2',
      autor: 'Carlos Eduardo',
      foto: 'https://api.dicebear.com/7.x/notionists/svg?seed=Carlos&backgroundColor=d91b5c',
      data: 'Ontem, 10:00',
      categoria: 'Alinhamento',
      texto: 'Alinhamento com a diretoria concluído. Precisamos de 3 voluntários.',
    }
  ]);
  const [novoComentario, setNovoComentario] = useState('');

  const handleEnviarComentario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoComentario.trim()) return;

    const comentario: Comentario = {
      id: Date.now().toString(),
      autor: 'Você', // mock current user
      foto: 'https://api.dicebear.com/7.x/notionists/svg?seed=Joao&backgroundColor=ffb2be',
      data: 'Agora',
      categoria: 'Geral',
      texto: novoComentario
    };

    setComentarios([...comentarios, comentario]);
    setNovoComentario('');
  };

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
                  <button className="flex items-center gap-2 text-sm text-text-main hover:text-cranberry transition-colors font-medium">
                    <User size={16} className="text-text-muted" />
                    {projeto.lider}
                  </button>
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
              {comentarios.map(com => (
                <div key={com.id} className="p-4 bg-brand-surface rounded-[12px] border border-brand-border flex gap-3">
                  <img src={com.foto} alt={com.autor} className="w-10 h-10 rounded-full bg-brand-surface-raised border border-brand-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span className="font-semibold text-text-main text-sm mr-2">{com.autor}</span>
                        <span className="text-[10px] text-text-muted">{com.data}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-brand-surface-raised border border-brand-border text-[9px] font-bold uppercase tracking-widest text-text-muted">
                        {com.categoria}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{com.texto}</p>
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
                placeholder="Adicionar atualização ou ata..."
                className="flex-1 bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              />
              <button 
                type="submit"
                disabled={!novoComentario.trim()}
                className="w-12 h-12 shrink-0 bg-cranberry text-on-cranberry rounded-[12px] flex items-center justify-center disabled:opacity-50 transition-colors"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </section>
        </div>
      </main>
      </div>
    </div>
  );
}
