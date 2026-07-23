import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Lock, UserRound, Phone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface RedefinirSenhaProps {
  onSuccess?: () => void | Promise<void>;
}

export function RedefinirSenha({ onSuccess }: RedefinirSenhaProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeSocial, setNomeSocial] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const hydrateSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (data.session?.user) {
        setSession(data.session);
      }

      setSessionLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!isActive) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setSession(currentSession);
        setSessionLoading(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setSessionLoading(false);
      }
    });

    void hydrateSession();

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!session?.user) {
      setErrorMessage('Sessão inválida. Abra novamente o link de convite enviado por e-mail.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const { error: senhaError } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (senhaError) {
        setErrorMessage(senhaError.message);
        return;
      }

      const { error: perfilError } = await supabase.from('associados').upsert({
        id: session.user.id,
        email: session.user.email,
        nome_social: nomeSocial,
        nome_completo: nomeCompleto,
        telefone: telefone || null,
        ativo: true,
      });

      if (perfilError) {
        setErrorMessage(perfilError.message);
        return;
      }

      alert('Cadastro concluído com sucesso!');

      if (onSuccess) {
        await onSuccess();
        return;
      }

      window.location.assign('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-brand-bg max-w-md mx-auto">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-16 h-16 bg-brand-surface-raised border border-brand-border rounded-[12px] flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full bg-cranberry"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-2">Primeiro Acesso</h1>
        <p className="text-sm text-text-muted">Defina sua senha e complete os dados de cadastro.</p>
      </div>

      {sessionLoading ? (
        <div className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-5 text-center text-sm text-text-muted">
          Validando seu link de convite...
        </div>
      ) : !session?.user ? (
        <div className="w-full bg-brand-surface border border-brand-border rounded-[12px] p-5 text-center text-sm text-red-400">
          Não foi possível validar sua sessão. Solicite um novo link de primeiro acesso.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nova Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                placeholder="Digite sua nova senha"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                placeholder="Repita sua nova senha"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome Completo
            </label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Nome Social
            </label>
            <div className="relative">
              <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={nomeSocial}
                onChange={(e) => setNomeSocial(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                placeholder="Como você prefere ser chamado(a)"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Telefone / WhatsApp (Opcional)
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] hover:bg-cranberry-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Concluindo cadastro...' : 'Concluir cadastro'}
          </button>

          {errorMessage ? (
            <p className="text-sm font-medium text-red-400 text-center" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
