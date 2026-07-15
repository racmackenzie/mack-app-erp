import { ArrowLeft, Mail, Phone, ShieldAlert } from 'lucide-react';

interface Membro {
  id: number;
  nome: string;
  cargo: string;
  profissao: string;
  email: string;
  whatsapp: string;
  avatar: string;
  sobre?: string;
  nomeSocial?: string;
}

interface DetalhesMembroProps {
  membro: Membro;
  isGuestView: boolean;
  onClose: () => void;
}

export function DetalhesMembro({ membro, isGuestView, onClose }: DetalhesMembroProps) {
  
  const blurContact = (text: string, type: 'email' | 'phone') => {
    if (type === 'email') {
      const parts = text.split('@');
      if (parts.length === 2) {
        return `${parts[0][0]}***@${parts[1]}`;
      }
      return '***@***';
    } else {
      return '(11) 9****-****';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center gap-3 bg-brand-surface shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-text-main truncate">Perfil do Associado</h2>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-6 max-w-md mx-auto">
          
          <div className="flex flex-col items-center text-center mt-4">
            <div className="w-24 h-24 rounded-full bg-brand-surface border-2 border-brand-border overflow-hidden mb-4">
              <img src={membro.avatar} alt={membro.nome} className="w-full h-full object-cover" />
            </div>
            
            <h1 className="text-2xl font-bold text-text-main mb-1">
              {membro.nome}
              {membro.nomeSocial && <span className="text-text-muted text-lg font-normal ml-2">({membro.nomeSocial})</span>}
            </h1>
            <p className="text-cranberry font-semibold text-sm mb-2">{membro.cargo}</p>
            <p className="text-sm text-text-muted">{membro.profissao}</p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-text-muted mb-1">Sobre Mim</h3>
            <p className="text-sm text-text-main leading-relaxed bg-brand-surface p-4 rounded-[12px] border border-brand-border">
              {membro.sobre || 'Nenhuma informação adicional fornecida.'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-text-muted mb-1">Contato</h3>
            
            <div className="flex flex-col gap-3 p-4 bg-brand-surface rounded-[12px] border border-brand-border">
              {isGuestView && (
                <div className="flex items-center gap-2 text-[12px] text-text-muted bg-brand-surface-raised px-3 py-2 rounded-[8px] border border-brand-border mb-2">
                  <ShieldAlert size={14} className="text-rotary-yellow" />
                  <span className="italic">Faça login para ver dados de contato.</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-surface-raised flex items-center justify-center text-text-muted shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">E-mail</p>
                    <p className={`text-sm ${isGuestView ? 'text-text-muted filter blur-[2px] select-none' : 'text-text-main font-medium'}`}>
                      {isGuestView ? blurContact(membro.email, 'email') : membro.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-brand-border my-1"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-surface-raised flex items-center justify-center text-text-muted shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">WhatsApp</p>
                    <p className={`text-sm ${isGuestView ? 'text-text-muted filter blur-[2px] select-none' : 'text-text-main font-medium'}`}>
                      {isGuestView ? blurContact(membro.whatsapp, 'phone') : membro.whatsapp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {!isGuestView && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button className="bg-brand-surface border border-brand-border text-text-main h-12 rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-brand-surface-raised transition-colors">
                  <Mail size={16} />
                  Enviar E-mail
                </button>
                <button className="bg-cranberry text-on-cranberry h-12 rounded-[12px] font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-cranberry-dark transition-colors">
                  <Phone size={16} />
                  WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
