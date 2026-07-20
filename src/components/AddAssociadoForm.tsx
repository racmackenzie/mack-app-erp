import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { X } from 'lucide-react';

export interface AssociadoFormValues {
  fotoUrl: string;
  nomeCompleto: string;
  nomeSocial: string;
  email: string;
  telefone: string;
  cargo: string;
  profissao: string;
  sobre: string;
}

interface AddAssociadoFormProps {
  onClose?: () => void;
  onSubmit?: (values: AssociadoFormValues) => Promise<void> | void;
  initialValues?: Partial<AssociadoFormValues>;
  title?: string;
  submitLabel?: string;
  hideEmail?: boolean;
  mode?: 'modal' | 'screen';
}

const defaultValues: AssociadoFormValues = {
  fotoUrl: '',
  nomeCompleto: '',
  nomeSocial: '',
  email: '',
  telefone: '',
  cargo: '',
  profissao: '',
  sobre: '',
};

export function AddAssociadoForm({
  onClose,
  onSubmit,
  initialValues,
  title = 'Novo Membro',
  submitLabel = 'Cadastrar Associado',
  hideEmail = false,
  mode = 'modal',
}: AddAssociadoFormProps) {
  const fotoInputId = useId();
  const [values, setValues] = useState<AssociadoFormValues>(defaultValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fotoNomeArquivo, setFotoNomeArquivo] = useState('');

  useEffect(() => {
    setValues({
      fotoUrl: initialValues?.fotoUrl ?? '',
      nomeCompleto: initialValues?.nomeCompleto ?? '',
      nomeSocial: initialValues?.nomeSocial ?? '',
      email: initialValues?.email ?? '',
      telefone: initialValues?.telefone ?? '',
      cargo: initialValues?.cargo ?? '',
      profissao: initialValues?.profissao ?? '',
      sobre: initialValues?.sobre ?? '',
    });
    setFotoNomeArquivo('');
  }, [initialValues]);

  const handleFotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFotoNomeArquivo('');
      setValues((current) => ({ ...current, fotoUrl: '' }));
      return;
    }

    setFotoNomeArquivo(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setValues((current) => ({ ...current, fotoUrl: String(reader.result ?? '') }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(values);
      } else {
        console.log(values);
        onClose?.();
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const wrapperClassName =
    mode === 'screen'
      ? 'min-h-screen flex flex-col bg-brand-bg w-full overflow-hidden'
      : 'fixed inset-0 z-50 flex items-center justify-center bg-brand-bg md:bg-black/50 md:backdrop-blur-sm md:p-4';

  const panelClassName =
    mode === 'screen'
      ? 'flex flex-col bg-brand-bg w-full min-h-screen overflow-hidden'
      : 'flex flex-col bg-brand-bg w-full h-full md:w-[600px] md:max-h-[85vh] md:h-auto md:rounded-2xl md:shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 duration-300';

  return (
    <div className={wrapperClassName}>
      <div className={panelClassName}>
      <header className="px-4 h-14 border-b border-brand-border flex items-center justify-between bg-brand-surface shrink-0">
        <h2 className="font-bold text-lg text-text-main">{title}</h2>
        {onClose ? (
          <button onClick={onClose} className="p-2 -mr-2 text-text-muted hover:text-text-main transition-colors">
            <X size={20} />
          </button>
        ) : null}
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <form id="add-associado-form" onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={values.nomeCompleto}
              onChange={(e) => setValues((current) => ({ ...current, nomeCompleto: e.target.value }))}
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
              value={values.nomeSocial}
              onChange={(e) => setValues((current) => ({ ...current, nomeSocial: e.target.value }))}
              placeholder="Ex: Ana"
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
              required
            />
          </div>

          {hideEmail ? null : (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
                E-mail
              </label>
              <input
                type="email"
                value={values.email}
                onChange={(e) => setValues((current) => ({ ...current, email: e.target.value }))}
                placeholder="nome@mackenzie.br"
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all"
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Telefone / WhatsApp
            </label>
            <input
              type="tel"
              value={values.telefone}
              onChange={(e) => setValues((current) => ({ ...current, telefone: e.target.value }))}
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
              value={values.cargo}
              onChange={(e) => setValues((current) => ({ ...current, cargo: e.target.value }))}
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
              value={values.profissao}
              onChange={(e) => setValues((current) => ({ ...current, profissao: e.target.value }))}
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
              value={values.sobre}
              onChange={(e) => setValues((current) => ({ ...current, sobre: e.target.value }))}
              placeholder="Breve biografia ou interesses..."
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry focus:ring-1 focus:ring-cranberry transition-all min-h-[80px] resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              FOTO DE PERFIL
            </label>
            <input
              id={fotoInputId}
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="hidden"
            />
            <label
              htmlFor={fotoInputId}
              className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-12 px-4 text-text-main flex items-center justify-between cursor-pointer hover:border-cranberry transition-all"
            >
              <span className="text-sm text-text-muted">
                {fotoNomeArquivo || 'Selecionar aqui'}
              </span>
              <span className="text-[12px] font-bold tracking-[0.05em] uppercase text-cranberry">
                Escolher arquivo
              </span>
            </label>
          </div>

          {errorMessage ? (
            <p className="text-sm font-medium text-red-400 text-center" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      </main>

      <footer className="shrink-0 bg-brand-surface border-t border-brand-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 shadow-lg mt-auto">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            form="add-associado-form"
            disabled={isSubmitting}
            className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center hover:bg-cranberry-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : submitLabel}
          </button>
        </div>
      </footer>
      </div>
    </div>
  );
}
