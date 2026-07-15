/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Associados } from './pages/Associados';
import { Projetos } from './pages/Projetos';
import { Calendario } from './pages/Calendario';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('/login');
  const [isGuest, setIsGuest] = useState<boolean>(true);

  const handleLogin = (guestMode: boolean) => {
    setIsGuest(guestMode);
    setCurrentRoute('/dashboard');
  };

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-text-main font-sans selection:bg-cranberry selection:text-on-cranberry flex h-screen overflow-hidden">
      {currentRoute === '/login' ? (
        <div className="w-full overflow-y-auto">
          <Login onLogin={handleLogin} />
        </div>
      ) : (
        <>
          <Sidebar currentRoute={currentRoute} navigate={navigate} />
          <div className="flex-1 overflow-y-auto relative w-full flex flex-col">
            {currentRoute === '/dashboard' && <Dashboard />}
            {currentRoute === '/associados' && <Associados initialIsGuest={isGuest} />}
            {currentRoute === '/projetos' && <Projetos />}
            {currentRoute === '/calendario' && <Calendario />}
            
            <BottomNav currentRoute={currentRoute} navigate={navigate} />
          </div>
        </>
      )}
    </div>
  );
}
