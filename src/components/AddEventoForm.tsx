import { useState } from 'react';
import { X } from 'lucide-react';

interface AddEventoFormProps {
  onClose: () => void;
}

export function AddEventoForm({ onClose }: AddEventoFormProps) {
  const [titulo, setTitulo] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [referente, setReferente] = useState('');
  const [projetoId, setProjetoId] = useState('');
  const [link, setLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ titulo, dataHora, referente, projetoId, link });
    onClose();
  };

  const referentes = ['Clube', 'Distrito 4563', 'Rotaract Brasil'];
  const projetosExemplo = [
    { id: '1', nome: 'Campanha do Agasalho' },
    { id: '2', nome: 'Mentoria Profissional' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
        <h2 className="font-bold text-lg text-text-main">Novo Compromisso</h2>
        <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <form id="add-evento-form" onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Título do Evento
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reunião Ordinária"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Data e Hora
            </label>
            <input
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Referente a
            </label>
            <select
              value={referente}
              onChange={(e) => setReferente(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
              required
            >
              <option value="" disabled>Selecione a referência</option>
              {referentes.map(ref => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Projeto Vinculado (Opcional)
            </label>
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all appearance-none"
            >
              <option value="">Nenhum projeto (Avulso)</option>
              {projetosExemplo.map(proj => (
                <option key={proj.id} value={proj.id}>{proj.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Link da Reunião (Meet/Zoom)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
            />
          </div>
        </form>
      </main>

      <footer className="shrink-0 bg-brand-surface border-t border-brand-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 shadow-lg mt-auto">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="add-evento-form"
            className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center hover:bg-cranberry-dark active:scale-[0.98] transition-all"
          >
            Adicionar à Agenda
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}
