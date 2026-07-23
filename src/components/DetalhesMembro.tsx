import { ArrowLeft, Mail, Phone, ShieldAlert, User } from 'lucide-react';

interface Membro {
  id: string | number;
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
  const ehConvidado = isGuestView;
  const displayName = membro.nome?.trim() || 'Associado(a)';
  const socialName = membro.nomeSocial?.trim() || '';
  const shouldShowSocialName = socialName.length > 0 && socialName !== displayName;
  const cargo = membro.cargo?.trim() || 'Associado(a)';
  const profissao = membro.profissao?.trim() || 'Profissão não informada';
  const email = membro.email?.trim() || '';
  const whatsapp = membro.whatsapp?.trim() || '';
  const sobre = membro.sobre?.trim() || 'Nenhuma informação adicional fornecida.';
  const hasAvatar = Boolean(membro.avatar?.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4">
      <div className="flex flex-col bg-brand-bg w-full h-full md:w-[920px] md:max-h-[88vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-right md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
      <header className="px-4 h-14 border-b border-brand-border flex items-center gap-3 bg-brand-surface shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-text-muted hover:text-text-main transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg text-text-main truncate">Perfil do Associado</h2>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 pb-2">
        <div className="w-full max-w-[860px] mx-auto grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-5 md:gap-7">
          <section className="flex flex-col gap-4">
            <div className="bg-brand-surface border border-brand-border rounded-[14px] p-4">
              <div className="aspect-square w-full rounded-[12px] bg-brand-bg border border-brand-border overflow-hidden flex items-center justify-center">
                {hasAvatar ? (
                  <img src={membro.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-text-muted" />
                )}
              </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-[14px] p-4 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Nome</p>
                <p className="text-xl font-bold text-text-main leading-tight mt-1">{displayName}</p>
                {shouldShowSocialName && <p className="text-sm text-text-muted">({socialName})</p>}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Profissão</p>
                <p className="text-sm text-text-main mt-1">{profissao}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Cargo</p>
                <p className="text-sm text-cranberry font-semibold mt-1">{cargo}</p>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="bg-brand-surface border border-brand-border rounded-[14px] p-4">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-text-muted mb-2">Descrição</h3>
              <p className="text-sm text-text-main leading-relaxed">{sobre}</p>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-[14px] p-4 flex flex-col gap-3">
              <h3 className="text-[12px] font-bold uppercase tracking-widest text-text-muted">Contatos</h3>

              {ehConvidado ? (
                <div className="flex items-center gap-2 text-[12px] text-text-muted bg-brand-surface-raised px-3 py-2 rounded-[8px] border border-brand-border">
                  <ShieldAlert size={14} className="text-rotary-yellow" />
                  <span className="italic">Faça login para ver as informações de contato.</span>
                </div>
              ) : (
                <>
                  {email && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-surface-raised flex items-center justify-center text-text-muted shrink-0">
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">E-mail</p>
                        <p className="text-sm break-all text-text-main font-medium">{email}</p>
                      </div>
                    </div>
                  )}

                  {email && whatsapp && <div className="w-full h-px bg-brand-border"></div>}

                  {whatsapp && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-surface-raised flex items-center justify-center text-text-muted shrink-0">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">WhatsApp</p>
                        <p className="text-sm text-text-main font-medium">{whatsapp}</p>
                      </div>
                    </div>
                  )}

                  {!email && !whatsapp && (
                    <p className="text-sm text-text-muted">Nenhuma informação de contato disponível.</p>
                  )}
                </>
              )}
            </div>

          </section>
        </div>
      </main>
      </div>
    </div>
  );
}
