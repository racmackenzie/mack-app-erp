/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Associados } from './pages/Associados';
import { Projetos } from './pages/Projetos';
import { Calendario } from './pages/Calendario';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { AddAssociadoForm, type AssociadoFormValues } from './components/AddAssociadoForm';
import { supabase } from './lib/supabaseClient';
import { RedefinirSenha } from './pages/RedefinirSenha';

const GUEST_ACTION_MESSAGE =
  'Você está navegando como convidado. Faça login como associado para realizar esta ação.';

interface AssociateRecord {
  id: string;
  foto_url: string | null;
  nome_completo: string | null;
  nome_social: string | null;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  profissao: string | null;
  sobre_mim: string | null;
  role: string | null;
}

const isBlank = (value?: string | null) => !value || value.trim().length === 0;

type AssociateProfile = {
  id: string;
  foto_url: string | null;
  nome_completo: string | null;
  nome_social: string | null;
  email: string | null;
  telefone: string | null;
  cargo: string | null;
  profissao: string | null;
  sobre_mim: string | null;
  role: string | null;
};

const isFirstAccessRoute = () => {
  const pathname = window.location.pathname;
  const hash = window.location.hash;

  return (
    pathname.includes('/redefinir-senha') ||
    hash.includes('access_token') ||
    hash.includes('type=invite') ||
    hash.includes('type=recovery')
  );
};

const getInitialRoute = () => (isFirstAccessRoute() ? '/redefinir-senha' : '/dashboard');

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentAssociate, setCurrentAssociate] = useState<AssociateRecord | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [mostrarModalCompletarPerfil, setMostrarModalCompletarPerfil] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const profileLoadRequestIdRef = useRef(0);
  const currentRouteRef = useRef(currentRoute);

  useEffect(() => {
    currentRouteRef.current = currentRoute;
  }, [currentRoute]);

  useEffect(() => {
    const pathname = window.location.pathname;
    const hash = window.location.hash;
    const ehRotaRedefinir =
      pathname.includes('/redefinir-senha') ||
      hash.includes('access_token') ||
      hash.includes('type=invite') ||
      hash.includes('type=recovery');

    if (ehRotaRedefinir) {
      setCurrentRoute('/redefinir-senha');
      setProfileLoading(false);
    }
  }, []);

  const showGuestRestrictedActionAlert = () => {
    alert(GUEST_ACTION_MESSAGE);
  };

  const loadCurrentAssociate = async (userId: string, requestId: number) => {
    try {
      const { data, error } = await supabase
        .from('associados')
        .select('id, foto_url, nome_completo, nome_social, email, telefone, cargo, profissao, sobre_mim, role')
        .eq('id', userId)
        .maybeSingle<AssociateProfile>();

      if (requestId !== profileLoadRequestIdRef.current) {
        return;
      }

      if (error) {
        throw error;
      }

      if (!data) {
        setCurrentAssociate(null);
        setUserRole(null);
        setNeedsOnboarding(true);
        setMostrarModalCompletarPerfil(true);
        return;
      }

      setCurrentAssociate(data);
      setUserRole(data.role ?? null);
      const perfilIncompleto = isBlank(data.nome_completo) || isBlank(data.telefone) || isBlank(data.nome_social);
      setNeedsOnboarding(perfilIncompleto);
      setMostrarModalCompletarPerfil(perfilIncompleto);
    } catch (error) {
      if (requestId !== profileLoadRequestIdRef.current) {
        return;
      }

      console.error('Erro ao buscar o associado logado:', error);
      setCurrentAssociate(null);
      setUserRole(null);
      setNeedsOnboarding(true);
      setMostrarModalCompletarPerfil(true);
    } finally {
      if (requestId === profileLoadRequestIdRef.current) {
        setProfileLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (profileLoading) {
        console.warn('Forcando encerramento de loading por Timeout');
        setProfileLoading(false);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [profileLoading]);

  useEffect(() => {
    let isActive = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (!isActive) {
        return;
      }

      if (session?.user) {
        setSession(session);
        setIsGuest(false);
        setCurrentUserId(session.user.id);
        if (currentRouteRef.current !== '/redefinir-senha') {
          setCurrentRoute('/dashboard');
        }
        setProfileLoading(true);
        const requestId = ++profileLoadRequestIdRef.current;
        await loadCurrentAssociate(session.user.id, requestId);
        return;
      }

      profileLoadRequestIdRef.current += 1;
      setSession(null);
      setCurrentUserId(null);
      setCurrentAssociate(null);
      setUserRole(null);
      setNeedsOnboarding(false);
      setMostrarModalCompletarPerfil(false);
      setIsGuest(true);
      if (currentRouteRef.current !== '/redefinir-senha') {
        setCurrentRoute('/dashboard');
      }
      setProfileLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const hasInviteHash =
        window.location.hash.includes('access_token') ||
        window.location.hash.includes('type=invite') ||
        window.location.hash.includes('type=recovery') ||
        window.location.pathname.includes('/redefinir-senha');

      if (hasInviteHash || event === 'PASSWORD_RECOVERY') {
        setSession(session);
        setCurrentRoute('/redefinir-senha');
        setProfileLoading(false);
        return;
      }

      setSession(session);

      if (!session?.user) {
        profileLoadRequestIdRef.current += 1;
        setCurrentUserId(null);
        setCurrentAssociate(null);
        setUserRole(null);
        setNeedsOnboarding(false);
        setMostrarModalCompletarPerfil(false);
        setIsGuest(event === 'SIGNED_OUT' ? false : true);
        setCurrentRoute(event === 'SIGNED_OUT' ? '/login' : '/dashboard');
        setProfileLoading(false);
        return;
      }

      setSession(session);
      setIsGuest(false);
      setCurrentUserId(session.user.id);
      if (currentRouteRef.current !== '/redefinir-senha') {
        setCurrentRoute('/dashboard');
      }
      setProfileLoading(true);
      const requestId = ++profileLoadRequestIdRef.current;

      try {
        const { data: profile, error } = await supabase
          .from('associados')
          .select('id, foto_url, nome_completo, nome_social, email, telefone, cargo, profissao, sobre_mim, role')
          .eq('id', session.user.id)
          .maybeSingle<AssociateProfile>();

        if (requestId !== profileLoadRequestIdRef.current) {
          return;
        }

        if (error) {
          console.error('Erro perfil:', error);
          setCurrentAssociate(null);
          setUserRole(null);
          setNeedsOnboarding(true);
          setMostrarModalCompletarPerfil(true);
          return;
        }

        if (!profile) {
          setCurrentAssociate(null);
          setUserRole(null);
          setNeedsOnboarding(true);
          setMostrarModalCompletarPerfil(true);
          return;
        }

        setCurrentAssociate(profile);
        setUserRole(profile.role ?? null);
        const perfilIncompleto =
          isBlank(profile.nome_completo) || isBlank(profile.telefone) || isBlank(profile.nome_social);
        setNeedsOnboarding(perfilIncompleto);
        setMostrarModalCompletarPerfil(perfilIncompleto);
      } catch (error) {
        if (requestId !== profileLoadRequestIdRef.current) {
          return;
        }

        console.error('Excecao ao buscar perfil:', error);
        setCurrentAssociate(null);
        setUserRole(null);
        setNeedsOnboarding(true);
        setMostrarModalCompletarPerfil(true);
      } finally {
        if (requestId === profileLoadRequestIdRef.current) {
          setProfileLoading(false);
        }
      }
    });

    void syncSession();

    return () => {
      isActive = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (guestMode: boolean) => {
    setIsGuest(guestMode);
    setCurrentRoute('/dashboard');

    if (!guestMode) {
      setProfileLoading(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole(null);
    setCurrentAssociate(null);
    setCurrentUserId(null);
    setNeedsOnboarding(false);
    setMostrarModalCompletarPerfil(false);
    setIsGuest(false);
    setCurrentRoute('/login');
    setProfileLoading(false);
  };

  const handleOnboardingSubmit = async (values: AssociadoFormValues) => {
    if (isGuest) {
      alert('Convidados não possuem perfil editável. Faça login para continuar.');
      throw new Error('Convidados não podem editar perfil.');
    }

    const userId = session?.user?.id;
    console.log('User ID da sessão:', userId);

    if (!userId) {
      throw new Error('Não foi possível identificar o usuário logado.');
    }

    const nomeCompleto = values.nomeCompleto;
    const nomeSocial = values.nomeSocial;
    const telefone = values.telefone;
    const cargo = values.cargo;
    const profissao = values.profissao;
    const sobreMim = values.sobre;
    const fotoUrl = values.fotoUrl;

    if (isBlank(nomeCompleto) || isBlank(nomeSocial) || isBlank(telefone)) {
      alert('Preencha nome completo, nome social e telefone antes de continuar.');
      throw new Error('Dados obrigatórios ausentes para envio ao Supabase.');
    }

    const payload = {
      nome_completo: nomeCompleto,
      nome_social: nomeSocial,
      telefone: telefone,
      cargo: cargo,
      profissao: profissao,
      sobre_mim: sobreMim,
      foto_url: fotoUrl,
    };
    console.log('Payload sendo enviado:', payload);

    let { data, error } = await supabase
      .from('associados')
      .update(payload)
      .eq('id', userId)
      .select();

    if (!error && (!data || data.length === 0)) {
      const insertResult = await supabase
        .from('associados')
        .insert([{ id: userId, email: session.user.email, ...payload }])
        .select();

      data = insertResult.data;
      error = insertResult.error;
    }

    if (error) {
      console.error('Erro completo do Supabase:', error);
      alert('Erro RLS: ' + error.message);
      throw new Error(error.message);
    }

    console.log('Dados gravados:', data);

    setCurrentAssociate(data?.[0] ?? null);
    setNeedsOnboarding(false);
    setMostrarModalCompletarPerfil(false);
    setCurrentRoute('/dashboard');
  };

  const onboardingInitialValues = currentAssociate
    ? {
        fotoUrl: currentAssociate.foto_url ?? '',
        nomeCompleto: currentAssociate.nome_completo ?? '',
        nomeSocial: currentAssociate.nome_social ?? '',
        email: currentAssociate.email ?? '',
        telefone: currentAssociate.telefone ?? '',
        cargo: currentAssociate.cargo ?? '',
        profissao: currentAssociate.profissao ?? '',
        sobre: currentAssociate.sobre_mim ?? '',
      }
    : undefined;

  const handleRedefinirSenhaSuccess = async () => {
    const userId = session?.user?.id;

    if (userId) {
      setProfileLoading(true);
      const requestId = ++profileLoadRequestIdRef.current;
      await loadCurrentAssociate(userId, requestId);
    }

    window.history.replaceState({}, document.title, '/');
    setCurrentRoute('/dashboard');
  };

  if (currentRoute === '/redefinir-senha') {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry">
        <RedefinirSenha onSuccess={handleRedefinirSenhaSuccess} />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-brand-bg text-text-main flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-brand-border border-t-cranberry animate-spin" />
          <p className="text-sm text-text-muted">Carregando seu perfil...</p>
        </div>
      </div>
    );
  }

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  const handleCompletarPerfil = () => {
    setMostrarModalCompletarPerfil(false);
    setCurrentRoute('/perfil');
  };

  const handleGoToLoginFromGuest = () => {
    setIsGuest(false);
    setCurrentRoute('/login');
  };

  if (!session && !isGuest) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry">
        <div className="w-full flex-1">
          <Login onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry">
      {currentRoute === '/login' ? (
        <div className="w-full flex-1">
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <>
          <Sidebar
            currentRoute={currentRoute}
            navigate={navigate}
            handleLogout={handleLogout}
            isGuest={isGuest}
            onGoToLogin={handleGoToLoginFromGuest}
            hasSession={Boolean(session)}
            userProfile={
              currentAssociate
                ? {
                    foto_url: currentAssociate.foto_url,
                    nome_social: currentAssociate.nome_social,
                    nome_completo: currentAssociate.nome_completo,
                  }
                : null
            }
          />
                <main className="flex-1 relative w-full flex flex-col pb-24 md:pb-8">
            {currentRoute === '/dashboard' && (
                <Dashboard
                  currentAssociate={currentAssociate}
                  onNavigate={navigate}
                  onLogout={handleLogout}
                  isGuest={isGuest}
                  onGoToLogin={handleGoToLoginFromGuest}
                />
            )}
            {currentRoute === '/perfil' && (
              <AddAssociadoForm
                mode="screen"
                title="Meu Perfil"
                submitLabel="Salvar Alterações"
                hideEmail
                initialValues={onboardingInitialValues}
                onSubmit={handleOnboardingSubmit}
                onClose={() => setCurrentRoute('/dashboard')}
              />
            )}
            {currentRoute === '/associados' && (
              <Associados
                initialIsGuest={isGuest}
                session={session}
                associadoLogado={currentAssociate}
              />
            )}
            {currentRoute === '/projetos' && (
              <Projetos
                isGuest={isGuest}
                onGuestBlockedAction={showGuestRestrictedActionAlert}
                onGoToLogin={handleGoToLoginFromGuest}
              />
            )}
            {currentRoute === '/calendario' && (
              <Calendario
                isGuest={isGuest}
                onGuestBlockedAction={showGuestRestrictedActionAlert}
              />
            )}
                  <div className="w-full h-32 clear-both pointer-events-none" />
                </main>
                <BottomNav currentRoute={currentRoute} navigate={navigate} />
          </div>
        </>
      )}

      {mostrarModalCompletarPerfil && session && !isGuest && currentRoute !== '/perfil' && needsOnboarding && (
        <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative">
            <div className="text-4xl" aria-hidden="true">👤</div>
            <h2 className="mt-4 text-2xl font-bold text-[#1F2937]">Complete seu Perfil</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
              Identificamos que seu cadastro ainda não está completo. Adicione suas informações para que os outros membros do clube possam te conhecer!
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleCompletarPerfil}
                className="w-full bg-[#E31C59] hover:bg-[#c41549] text-white font-medium py-3 rounded-xl transition-all shadow-sm"
              >
                Completar Perfil
              </button>
              <button
                onClick={() => setMostrarModalCompletarPerfil(false)}
                className="w-full py-2 text-sm font-medium text-[#6B7280] hover:text-[#374151] transition-colors"
              >
                Lembrar mais tarde
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
