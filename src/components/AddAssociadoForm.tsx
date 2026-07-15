import { useState } from 'react';
import { X } from 'lucide-react';

interface AddAssociadoFormProps {
  onClose: () => void;
}

export function AddAssociadoForm({ onClose }: AddAssociadoFormProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeSocial, setNomeSocial] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [profissao, setProfissao] = useState('');
  const [sobre, setSobre] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ nomeCompleto, nomeSocial, email, telefone, cargo, profissao, sobre });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
        <h2 className="font-bold text-lg text-text-main">Novo Membro</h2>
        <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors">
          <X size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <form id="add-associado-form" onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Ex: Ana Flávia da Silva"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome Social / Apelido
            </label>
            <input
              type="text"
              value={nomeSocial}
              onChange={(e) => setNomeSocial(e.target.value)}
              placeholder="Ex: Ana"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@mackenzie.br"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Cargo Atual
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Ex: Diretor de Imagem Pública"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Profissão
            </label>
            <input
              type="text"
              value={profissao}
              onChange={(e) => setProfissao(e.target.value)}
              placeholder="Ex: Estudante de Administração"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Sobre Mim
            </label>
            <textarea
              value={sobre}
              onChange={(e) => setSobre(e.target.value)}
              placeholder="Breve biografia ou interesses..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all min-h-[80px] resize-none"
            />
          </div>
        </form>
      </main>

      <footer className="shrink-0 bg-brand-surface border-t border-brand-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 shadow-lg mt-auto">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="add-associado-form"
            className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center hover:bg-cranberry-dark active:scale-[0.98] transition-all"
          >
            Cadastrar Associado
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}
