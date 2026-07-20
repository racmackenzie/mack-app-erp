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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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
      setLoading(false);
      return;
    }

    onLogin(false);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-12 bg-brand-bg max-w-md mx-auto">
      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-brand-surface-raised border border-brand-border rounded-[12px] flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full bg-cranberry"></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main mb-2">Mackenzie</h1>
        <p className="text-sm font-bold tracking-[0.05em] uppercase text-text-muted">
          Rotaract Club Copilot
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold tracking-[0.05em] uppercase text-text-muted ml-1">
            E-mail Institucional
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-cranberry text-on-cranberry h-14 rounded-[12px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-cranberry-dark active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Acessar Plataforma'}
          <ArrowRight size={20} className={loading ? 'animate-pulse' : ''} />
        </button>
      </form>

      {errorMessage ? (
        <p className="mt-4 text-sm font-medium text-red-400 text-center" role="alert">
          {errorMessage}
        </p>
      ) : null}

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
    </div>
  );
}
