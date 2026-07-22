/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
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

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentAssociate, setCurrentAssociate] = useState<AssociateRecord | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const showGuestRestrictedActionAlert = () => {
    alert(GUEST_ACTION_MESSAGE);
  };

  const loadCurrentAssociate = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('associados')
        .select('id, foto_url, nome_completo, nome_social, email, telefone, cargo, profissao, sobre_mim, role')
        .eq('id', userId)
        .maybeSingle<AssociateProfile>();

      if (error) {
        throw error;
      }

      if (!data) {
        setCurrentAssociate(null);
        setUserRole(null);
        setNeedsOnboarding(true);
        return;
      }

      setCurrentAssociate(data);
      setUserRole(data.role ?? null);
      setNeedsOnboarding(isBlank(data.telefone) || isBlank(data.nome_social));
    } catch (error) {
      console.error('Erro ao buscar o associado logado:', error);
      setCurrentAssociate(null);
      setUserRole(null);
      setNeedsOnboarding(true);
    } finally {
      setProfileLoading(false);
    }
  };

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
        setCurrentRoute('/dashboard');
        await loadCurrentAssociate(session.user.id);
        return;
      }

      setSession(null);
      setCurrentUserId(null);
      setCurrentAssociate(null);
      setUserRole(null);
      setNeedsOnboarding(false);
      setIsGuest(true);
      setCurrentRoute('/dashboard');
      setProfileLoading(false);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setSession(null);
        setCurrentUserId(null);
        setCurrentAssociate(null);
        setUserRole(null);
        setNeedsOnboarding(false);
        setIsGuest(true);
        setCurrentRoute('/dashboard');
        setProfileLoading(false);
        return;
      }

      setSession(session);
      setIsGuest(false);
      setCurrentUserId(session.user.id);
      setCurrentRoute('/dashboard');
      setProfileLoading(true);
      await loadCurrentAssociate(session.user.id);
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
    setIsGuest(true);
    setCurrentRoute('/dashboard');
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

  const handleGoToLoginFromGuest = () => {
    setIsGuest(false);
    setCurrentRoute('/login');
  };

  if (!session && !isGuest) {
    return (
      <div className="min-h-screen bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry flex h-screen overflow-hidden">
        <div className="w-full overflow-y-auto">
          <Login onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry flex h-screen overflow-hidden">
      {currentRoute === '/login' ? (
        <div className="w-full overflow-y-auto">
          <Login onLogin={handleLogin} />
        </div>
      ) : needsOnboarding ? (
        <div className="w-full overflow-y-auto">
          <AddAssociadoForm
            mode="screen"
            title="Completar Perfil"
            submitLabel="Salvar"
            hideEmail
            initialValues={onboardingInitialValues}
            onSubmit={handleOnboardingSubmit}
          />
        </div>
      ) : (
        <>
          <Sidebar
            currentRoute={currentRoute}
            navigate={navigate}
            handleLogout={handleLogout}
            isGuest={isGuest}
            onGoToLogin={handleGoToLoginFromGuest}
          />
          <div className="flex-1 overflow-y-auto relative w-full flex flex-col">
            {isGuest && (
              <div className="md:hidden px-4 pt-4">
                <div className="rounded-[12px] border border-brand-border bg-brand-surface-raised p-3 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Modo Convidado</span>
                  <button
                    onClick={handleGoToLoginFromGuest}
                    className="px-3 py-1.5 rounded-[8px] bg-cranberry text-on-cranberry text-[11px] font-bold uppercase tracking-widest hover:bg-cranberry-dark transition-colors"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
            {currentRoute === '/dashboard' && (
              <Dashboard currentAssociate={currentAssociate} onNavigate={navigate} />
            )}
            {currentRoute === '/associados' && <Associados initialIsGuest={isGuest} />}
            {currentRoute === '/projetos' && (
              <Projetos
                isGuest={isGuest}
                onGuestBlockedAction={showGuestRestrictedActionAlert}
              />
            )}
            {currentRoute === '/calendario' && (
              <Calendario
                isGuest={isGuest}
                onGuestBlockedAction={showGuestRestrictedActionAlert}
              />
            )}
            
            <BottomNav currentRoute={currentRoute} navigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
}
