// App Shell Principal: Viewport Switcher, Dual Theme, Country Isolation & Nav

const App = () => {
  const [country, setCountry] = useState("AR");
  const [roleView, setRoleView] = useState('worker'); // 'worker' | 'agency'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isDark = isDarkMode;
  const [currentView, setCurrentView] = useState('app'); // 'app' | 'login' | 'onboarding'
  const [viewportMode, setViewportMode] = useState('mobile'); // 'mobile' (393px) | 'tablet' (768px)

  // Sub-tabs de Productora
  const [prodTab, setProdTab] = useState('evento');
  // Sub-tabs de Staff
  const [staffTab, setStaffTab] = useState('inicio');

  // Estado mutable de producciones por país
  const [eventsState, setEventsState] = useState(EVENTS_DATA);
  const [selectedEventId, setSelectedEventId] = useState({
    AR: "lolla-ar",
    ES: "mwc-es"
  });

  const [toastData, setToastData] = useState(null);

  // Sincronizar dark mode en <html>
  useEffect(() => {
    const rootHtml = document.documentElement;
    if (isDarkMode) {
      rootHtml.classList.add('dark');
    } else {
      rootHtml.classList.remove('dark');
    }
  }, [isDarkMode]);

  const showToast = (message, type = "info") => {
    setToastData({ message, type });
    setTimeout(() => {
      setToastData(null);
    }, 3500);
  };

  // Evento activo actual
  const countryEvents = eventsState[country] || eventsState.AR;
  const activeEventId = selectedEventId[country] || countryEvents[0].id;
  const currentEvent = countryEvents.find(e => e.id === activeEventId) || countryEvents[0];

  const handleSelectEvent = (eventId) => {
    setSelectedEventId(prev => ({
      ...prev,
      [country]: eventId
    }));
  };

  // Aplicar Smart Backup
  const handleSmartBackupApplied = (oldWorkerId, backupCandidate) => {
    setEventsState(prev => {
      const currentList = prev[country];
      const updatedList = currentList.map(ev => {
        if (ev.id === currentEvent.id) {
          const updatedWorkers = ev.workers.map(w => {
            if (w.id === oldWorkerId) {
              return { ...w, status: "Baja" };
            }
            return w;
          });
          // Insertar suplente al inicio
          updatedWorkers.unshift({
            ...backupCandidate,
            id: Date.now(),
            status: "Confirmados",
            role: "Promotores"
          });
          return {
            ...ev,
            workers: updatedWorkers
          };
        }
        return ev;
      });

      return {
        ...prev,
        [country]: updatedList
      };
    });
  };

  return (
    <AppContext.Provider value={{ isDark: isDarkMode, country, showToast }}>
      <div className={`min-h-screen w-full flex flex-col items-center justify-start py-2 sm:py-5 px-0 sm:px-4 transition-colors ${
        isDarkMode ? 'bg-[#09090B]' : 'bg-[#E2E8F0]'
      }`}>
        {/* =========================================================================
            BARRA EXTERNA DE PRUEBAS & PRESENTACIÓN (Fuera del marco simulado)
        ========================================================================= */}
        <header className="w-full max-w-[393px] mb-2.5 flex items-center justify-between gap-1.5 px-3 select-none">
          {/* Logo & Version */}
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-input bg-sky-400 flex items-center justify-center text-[#09090B] font-black text-xs shadow-glow-sky-subtle">
              E
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-xs tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-slate-900'}`}>
                EventuApp
              </span>
              <span className="text-[9px] font-mono text-zinc-500">v1.0 • B2B2C</span>
            </div>
          </div>

          {/* Quick Switchers */}
          <div className="flex items-center gap-1.5">
            {/* Country Toggle (AR / ES) */}
            <div className={`p-0.5 rounded-full border flex items-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300'}`}>
              <button
                onClick={() => {
                  setCountry("AR");
                  showToast("🇦🇷 Argentina (DNI, Monotributo, Póliza AP)", "info");
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  country === "AR" ? 'bg-sky-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                AR
              </button>
              <button
                onClick={() => {
                  setCountry("ES");
                  showToast("🇪🇸 España (NIE, Seguridad Social, PRL)", "info");
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  country === "ES" ? 'bg-sky-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                ES
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-7 px-2 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition-all ${
                isDarkMode ? 'bg-zinc-900 text-zinc-200 border-zinc-700' : 'bg-white text-slate-800 border-slate-300 shadow-sm'
              }`}
              title="Alternar Modo Oscuro / Claro"
            >
              <i className={`ph-fill ${isDarkMode ? 'ph-moon text-sky-400' : 'ph-sun text-amber-500'}`} />
            </button>

            {/* Role Switcher (Staff / Prod) */}
            <div className={`p-0.5 rounded-full border flex items-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-300'}`}>
              <button
                onClick={() => {
                  setRoleView('worker');
                  setCurrentView('app');
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  roleView === 'worker' && currentView === 'app' ? 'bg-sky-400 text-[#09090B] font-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Staff
              </button>
              <button
                onClick={() => {
                  setRoleView('agency');
                  setCurrentView('app');
                }}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  roleView === 'agency' && currentView === 'app' ? 'bg-sky-400 text-[#09090B] font-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Prod
              </button>
            </div>

            {/* Direct Login Key */}
            <button
              onClick={() => setCurrentView(currentView === 'login' ? 'app' : 'login')}
              className={`h-7 px-2 rounded-full text-[10px] font-semibold border transition-all ${
                currentView === 'login' ? 'bg-sky-400 text-zinc-950 border-sky-400 font-bold' : isDark ? 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200' : 'bg-white text-slate-600 border-slate-300'
              }`}
              title="Acceder a la cuenta"
            >
              <i className="ph ph-key text-xs" />
            </button>
          </div>
        </header>

        {/* =========================================================================
            CONTENEDOR MOBILE ESTRICTO (393px Centrado & Relative)
        ========================================================================= */}
        <main className={`
          w-full max-w-full sm:max-w-[393px] h-[100dvh] sm:h-[852px] sm:max-h-[90dvh] mx-auto 
          relative overflow-hidden sm:rounded-[40px] sm:border-[8px] border-zinc-800 shadow-2xl flex flex-col transition-colors
          ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-900'}
        `}>
          {/* Simulated iOS Status Bar */}
          <div className={`h-7 w-full flex justify-between items-center px-5 font-mono text-[10px] font-semibold select-none shrink-0 ${
            isDarkMode ? 'text-zinc-400 bg-zinc-950' : 'text-slate-500 bg-slate-50'
          }`}>
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-xs">
              <i className="ph-fill ph-cell-signal-full" />
              <i className="ph-fill ph-wifi-high" />
              <i className="ph-fill ph-battery-full text-sm" />
            </div>
          </div>

          {/* Área de Vistas con scroll interno y padding-bottom para BottomNav */}
          <div className="flex-1 w-full overflow-hidden relative min-w-0 pb-20">
            {currentView === 'login' && (
              <LoginScreen 
                role={roleView}
                setRole={setRoleView}
                onLoginSuccess={(selectedRole) => {
                  setRoleView(selectedRole);
                  setCurrentView('app');
                }}
                onStartOnboarding={() => setCurrentView('onboarding')}
              />
            )}

            {currentView === 'onboarding' && (
              <StaffOnboarding 
                onComplete={() => {
                  setRoleView('worker');
                  setCurrentView('app');
                }}
                onCancel={() => setCurrentView('login')}
              />
            )}

            {currentView === 'app' && (
              roleView === 'agency' ? (
                // VISTA PRODUCTORA (4 Tabs)
                prodTab === 'evento' ? (
                  <AgencyTabEvento 
                    currentEvent={currentEvent}
                    eventsList={countryEvents}
                    onSelectEvent={handleSelectEvent}
                    onSmartBackupApplied={handleSmartBackupApplied}
                  />
                ) : prodTab === 'fechas' ? (
                  <AgencyTabFechas />
                ) : prodTab === 'talento' ? (
                  <AgencyTabTalento />
                ) : (
                  <AgencyTabAvisos />
                )
              ) : (
                // VISTA STAFF (4 Tabs)
                staffTab === 'inicio' ? (
                  <WorkerTabInicio currentEvent={currentEvent} />
                ) : staffTab === 'agenda' ? (
                  <WorkerTabAgenda />
                ) : staffTab === 'cobros' ? (
                  <WorkerTabCobros />
                ) : (
                  <WorkerTabMiPerfil onLogout={() => setCurrentView('login')} />
                )
              )
            )}
          </div>

          {/* =========================================================================
              BOTTOM NAVIGATION BAR (Exclusivo por Rol y Absoluto al Contenedor 393px)
          ========================================================================= */}
          {currentView === 'app' && roleView === 'agency' && (
            <nav className={`absolute bottom-0 w-full h-[72px] border-t backdrop-blur-lg flex justify-around items-center px-2 pb-2 z-30 ${
              isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-500' : 'bg-white/90 border-slate-200 text-slate-400'
            }`}>
              <button 
                onClick={() => setProdTab('evento')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'evento' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'evento' ? 'ph-fill ph-broadcast' : 'ph ph-broadcast'}`} />
                <span className="text-[10px] font-bold">Evento</span>
              </button>
              <button 
                onClick={() => setProdTab('fechas')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'fechas' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'fechas' ? 'ph-fill ph-calendar-plus' : 'ph ph-calendar-plus'}`} />
                <span className="text-[10px] font-semibold">Fechas</span>
              </button>
              <button 
                onClick={() => setProdTab('talento')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'talento' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'talento' ? 'ph-fill ph-users-three' : 'ph ph-users-three'}`} />
                <span className="text-[10px] font-semibold">Talento</span>
              </button>
              <button 
                onClick={() => setProdTab('avisos')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'avisos' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <div className="relative">
                  <i className={`text-xl ${prodTab === 'avisos' ? 'ph-fill ph-bell' : 'ph ph-bell'}`} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] font-semibold">Avisos</span>
              </button>
            </nav>
          )}

          {currentView === 'app' && roleView === 'worker' && (
            <nav className={`absolute bottom-0 w-full h-[72px] border-t backdrop-blur-lg flex justify-around items-center px-2 pb-2 z-30 ${
              isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-500' : 'bg-white/90 border-slate-200 text-slate-400'
            }`}>
              <button 
                onClick={() => setStaffTab('inicio')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'inicio' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'inicio' ? 'ph-fill ph-house' : 'ph ph-house'}`} />
                <span className="text-[10px] font-bold">Inicio</span>
              </button>
              <button 
                onClick={() => setStaffTab('agenda')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'agenda' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'agenda' ? 'ph-fill ph-calendar-blank' : 'ph ph-calendar-blank'}`} />
                <span className="text-[10px] font-semibold">Agenda</span>
              </button>
              <button 
                onClick={() => setStaffTab('cobros')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'cobros' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'cobros' ? 'ph-fill ph-wallet' : 'ph ph-wallet'}`} />
                <span className="text-[10px] font-semibold">Cobros</span>
              </button>
              <button 
                onClick={() => setStaffTab('miperfil')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'miperfil' ? (isDarkMode ? 'text-sky-400' : 'text-sky-600') : 'hover:opacity-80'}`}
              >
                <div className="relative">
                  <i className={`text-xl ${staffTab === 'miperfil' ? 'ph-fill ph-user-circle' : 'ph ph-user-circle'}`} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] font-semibold">Mi Perfil</span>
              </button>
            </nav>
          )}

          {/* Feedback Toast Notification */}
          <FeedbackToast
            message={toastData?.message}
            type={toastData?.type}
            onClose={() => setToastData(null)}
          />
        </main>
      </div>
    </AppContext.Provider>
  );
};

// Mount Root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
