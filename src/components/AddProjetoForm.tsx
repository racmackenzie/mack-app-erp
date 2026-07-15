import { useState } from 'react';
import { X } from 'lucide-react';

interface AddProjetoFormProps {
  onClose: () => void;
}

export function AddProjetoForm({ onClose }: AddProjetoFormProps) {
  const [nome, setNome] = useState('');
  const [avenida, setAvenida] = useState('');
  const [status, setStatus] = useState('');
  const [marcoAtual, setMarcoAtual] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    console.log({ nome, avenida, status, marcoAtual, detalhes, link });
    onClose();
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
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
        <h2 className="font-bold text-lg text-text-main">Novo Projeto</h2>
        <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <form id="add-projeto-form" onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome do Projeto
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Campanha do Agasalho"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
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
              {avenidas.map(av => (
                <option key={av} value={av}>{av}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
              required
            >
              <option value="" disabled>Selecione o Status</option>
              {statusOptions.map(st => (
                <option key={st} value={st}>{st}</option>
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
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Detalhes / Resumo
            </label>
            <textarea
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Descreva o objetivo e detalhes do projeto..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all min-h-[100px] resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Link do Grupo de WhatsApp
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
            />
          </div>
        </form>
      </main>

      <footer className="shrink-0 bg-brand-surface border-t border-brand-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 shadow-lg mt-auto">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="add-projeto-form"
            className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center hover:bg-cranberry-dark active:scale-[0.98] transition-all"
          >
            Criar Projeto
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}
