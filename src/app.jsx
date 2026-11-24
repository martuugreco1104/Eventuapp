// App Shell Principal: Viewport Switcher, Dual Theme, Country Isolation & Nav

const App = () => {
  const [country, setCountry] = useState("AR");
  const [roleView, setRoleView] = useState('worker'); // 'worker' | 'agency'
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isDark = isDarkMode;
  const [currentView, setCurrentView] = useState('app'); // 'app' | 'login' | 'onboarding'
  const [demoOpen, setDemoOpen] = useState(false);

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
      <div className={`min-h-screen w-full flex flex-col items-center justify-center py-0 sm:py-6 px-0 sm:px-4 transition-colors relative ${
        isDarkMode ? 'bg-[#09090B]' : 'bg-[#F1F5F9]'
      }`}>

        {/* =========================================================================
            PILL FLOTANTE Y DISCRETO DE DEMO (Descongestiona el Shell Superior)
        ========================================================================= */}
        <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 flex flex-col items-end">
          {!demoOpen ? (
            <button
              onClick={() => setDemoOpen(true)}
              className={`h-8 px-3 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-2 shadow-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-zinc-900/85 border-zinc-700/80 text-zinc-200 hover:bg-zinc-800' 
                  : 'bg-white/90 border-slate-300 text-slate-800 hover:bg-white shadow-sm'
              }`}
              title="Abrir controles de prueba Demo"
            >
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span className="font-mono text-[11px] font-bold">Demo ⚙️</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                [{country}] [{roleView === 'worker' ? 'Staff' : 'Prod'}]
              </span>
            </button>
          ) : (
            <div className={`p-3 rounded-hero border backdrop-blur-xl shadow-2xl w-64 animate-fade-in space-y-2.5 ${
              isDarkMode ? 'bg-zinc-900/95 border-zinc-700 text-zinc-100' : 'bg-white/95 border-slate-300 text-slate-900'
            }`}>
              {/* Header Panel */}
              <div className="flex justify-between items-center pb-1 border-b border-zinc-800/80">
                <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1">
                  <i className="ph-bold ph-gear text-sm" /> Controles Demo
                </span>
                <button
                  onClick={() => setDemoOpen(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-100 cursor-pointer text-xs"
                >
                  <i className="ph ph-x" />
                </button>
              </div>

              {/* Selector País */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-400">País</span>
                <div className={`p-0.5 rounded-full border flex items-center ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    onClick={() => {
                      setCountry("AR");
                      showToast("🇦🇷 Argentina (DNI, Monotributo, Póliza AP)", "info");
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      country === "AR" ? 'bg-sky-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    🇦🇷 AR
                  </button>
                  <button
                    onClick={() => {
                      setCountry("ES");
                      showToast("🇪🇸 España (NIE, Seguridad Social, PRL)", "info");
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      country === "ES" ? 'bg-sky-400 text-zinc-950 font-black' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    🇪🇸 ES
                  </button>
                </div>
              </div>

              {/* Selector Rol */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-400">Rol</span>
                <div className={`p-0.5 rounded-full border flex items-center ${isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
                  <button
                    onClick={() => {
                      setRoleView('worker');
                      setCurrentView('app');
                    }}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
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
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      roleView === 'agency' && currentView === 'app' ? 'bg-sky-400 text-[#09090B] font-black' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Prod
                  </button>
                </div>
              </div>

              {/* Toggle Tema */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-400">Tema</span>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`h-7 px-3 rounded-full text-[10px] font-semibold flex items-center gap-1.5 border transition-all ${
                    isDarkMode ? 'bg-zinc-950 text-zinc-200 border-zinc-800' : 'bg-white text-slate-800 border-slate-300 shadow-sm'
                  }`}
                >
                  <i className={`ph-fill ${isDarkMode ? 'ph-moon text-sky-400' : 'ph-sun text-amber-500'}`} />
                  <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                </button>
              </div>

              {/* Botón Login Directo */}
              <div className="pt-1 border-t border-zinc-800/80">
                <button
                  onClick={() => {
                    setCurrentView(currentView === 'login' ? 'app' : 'login');
                    setDemoOpen(false);
                  }}
                  className="w-full h-8 rounded-input border border-zinc-700/60 text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800/60 transition-colors"
                >
                  <i className="ph ph-key" />
                  <span>{currentView === 'login' ? 'Volver a la App' : 'Ver Pantalla de Login'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

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
            isDarkMode ? 'text-zinc-400 bg-zinc-950' : 'text-slate-600 bg-slate-50'
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
            <nav className={`absolute bottom-0 w-full h-[70px] border-t backdrop-blur-lg flex justify-around items-center px-2 pt-1 pb-2 z-30 ${
              isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-500' : 'bg-white/95 border-slate-200 text-slate-400'
            }`}>
              <button 
                onClick={() => setProdTab('evento')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'evento' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'evento' ? 'ph-fill ph-broadcast' : 'ph ph-broadcast'}`} />
                <span className="text-[10px] tracking-tight">Evento</span>
              </button>
              <button 
                onClick={() => setProdTab('fechas')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'fechas' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'fechas' ? 'ph-fill ph-calendar-plus' : 'ph ph-calendar-plus'}`} />
                <span className="text-[10px] tracking-tight">Fechas</span>
              </button>
              <button 
                onClick={() => setProdTab('talento')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'talento' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${prodTab === 'talento' ? 'ph-fill ph-users-three' : 'ph ph-users-three'}`} />
                <span className="text-[10px] tracking-tight">Talento</span>
              </button>
              <button 
                onClick={() => setProdTab('avisos')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${prodTab === 'avisos' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <div className="relative">
                  <i className={`text-xl ${prodTab === 'avisos' ? 'ph-fill ph-bell' : 'ph ph-bell'}`} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] tracking-tight">Avisos</span>
              </button>
            </nav>
          )}

          {currentView === 'app' && roleView === 'worker' && (
            <nav className={`absolute bottom-0 w-full h-[70px] border-t backdrop-blur-lg flex justify-around items-center px-2 pt-1 pb-2 z-30 ${
              isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80 text-zinc-500' : 'bg-white/95 border-slate-200 text-slate-400'
            }`}>
              <button 
                onClick={() => setStaffTab('inicio')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'inicio' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'inicio' ? 'ph-fill ph-house' : 'ph ph-house'}`} />
                <span className="text-[10px] tracking-tight">Inicio</span>
              </button>
              <button 
                onClick={() => setStaffTab('agenda')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'agenda' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'agenda' ? 'ph-fill ph-calendar-blank' : 'ph ph-calendar-blank'}`} />
                <span className="text-[10px] tracking-tight">Agenda</span>
              </button>
              <button 
                onClick={() => setStaffTab('cobros')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'cobros' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <i className={`text-xl ${staffTab === 'cobros' ? 'ph-fill ph-wallet' : 'ph ph-wallet'}`} />
                <span className="text-[10px] tracking-tight">Cobros</span>
              </button>
              <button 
                onClick={() => setStaffTab('miperfil')}
                className={`flex flex-col items-center gap-0.5 cursor-pointer py-1 ${staffTab === 'miperfil' ? (isDarkMode ? 'text-sky-400 font-bold' : 'text-sky-600 font-bold') : 'hover:opacity-80'}`}
              >
                <div className="relative">
                  <i className={`text-xl ${staffTab === 'miperfil' ? 'ph-fill ph-user-circle' : 'ph ph-user-circle'}`} />
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 absolute -top-0.5 -right-0.5" />
                </div>
                <span className="text-[10px] tracking-tight">Mi Book</span>
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
