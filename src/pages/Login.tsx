import { useState, type FormEvent } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onLogin: (asGuest: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailReset, setEmailReset] = useState('');
  const [carregandoReset, setCarregandoReset] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const invalidCredentials =
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid') ||
          error.status === 400;

        setErrorMessage(
          invalidCredentials
            ? 'E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.'
            : 'Não foi possível realizar o login. Tente novamente em instantes.'
        );
        return;
      }

      // O ciclo global de sessão/loading é controlado pelo onAuthStateChange em App.
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregandoReset(true);

    const { error } = await supabase.auth.resetPasswordForEmail(emailReset, {
      redirectTo: 'https://mack-app-erp.vercel.app/redefinir-senha',
    });

    setCarregandoReset(false);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setModoEsqueciSenha(false);
      setEmailReset('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-brand-bg max-w-md mx-auto">
      <div className="flex justify-center mb-12">
        <img
          src="/logo-rotaract-mackenzie.png"
          alt="Rotaract Club Universidade Mackenzie"
          className="h-16 md:h-20 w-auto object-contain"
        />
      </div>

      {modoEsqueciSenha ? (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4 w-full">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-text-main">Recuperar Senha</h2>
            <p className="mt-1 text-sm text-text-muted">
              Digite seu e-mail para receber o link de redefinição.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="email"
                value={emailReset}
                onChange={(e) => setEmailReset(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregandoReset}
            className="mt-2 w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-cranberry-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {carregandoReset ? 'Enviando...' : 'Enviar E-mail de Recuperação'}
          </button>

          <button
            type="button"
            onClick={() => setModoEsqueciSenha(false)}
            className="text-sm text-text-muted hover:text-cranberry transition-colors"
          >
            ← Voltar para o Login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@mackenzie.br"
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-brand-surface border border-brand-border rounded-[12px] h-14 pl-12 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-cranberry transition-colors"
                required
              />
            </div>

            <div className="flex justify-end mt-1 mb-4">
              <button
                type="button"
                onClick={() => setModoEsqueciSenha(true)}
                className="text-xs font-medium text-text-muted hover:text-cranberry hover:underline transition-colors"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-cranberry-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Acessar Plataforma'}
            <ArrowRight size={20} className={loading ? 'animate-pulse' : ''} />
          </button>
        </form>
      )}

      {errorMessage && !modoEsqueciSenha ? (
        <p className="mt-4 text-sm font-medium text-red-400 text-center" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!modoEsqueciSenha ? (
        <>
          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-brand-border"></div>
            <span className="bg-brand-bg px-4 text-xs font-bold tracking-widest uppercase text-text-muted z-10">
              Ou
            </span>
          </div>

          <button
            onClick={() => onLogin(true)}
            disabled={loading}
            className="mt-8 w-full bg-transparent border border-brand-border text-text-main h-14 rounded-[12px] font-semibold text-[16px] hover:bg-brand-surface active:scale-[0.98] transition-all"
          >
            Acessar como Convidado
          </button>
        </>
      ) : null}
    </div>
  );
}
