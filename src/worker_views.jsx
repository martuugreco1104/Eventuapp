// Vistas de Staff (B2C): Inicio, Agenda, Cobros, Mi Perfil

const WorkerTabInicio = ({ currentEvent }) => {
  const { isDark, showToast, country, userProfile } = useContext(AppContext);
  const [hasShiftToday, setHasShiftToday] = useState(true);
  const [checkedInState, setCheckedInState] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [secondsInShift, setSecondsInShift] = useState(0);
  const [gpsErrorState, setGpsErrorState] = useState(false);
  const [proposals, setProposals] = useState(STAFF_PROPOSALS[country] || STAFF_PROPOSALS.AR);

  // Sincronizar propuestas al cambiar país
  useEffect(() => {
    setProposals(STAFF_PROPOSALS[country] || STAFF_PROPOSALS.AR);
  }, [country]);

  // Cronómetro del turno en vivo
  useEffect(() => {
    let interval = null;
    if (checkedInState) {
      interval = setInterval(() => {
        setSecondsInShift((prev) => prev + 1);
      }, 1000);
    } else {
      setSecondsInShift(0);
    }
    return () => clearInterval(interval);
  }, [checkedInState]);

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, "0");
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleFicharGPS = () => {
    setIsCheckingIn(true);
    setGpsErrorState(false);
    setTimeout(() => {
      setIsCheckingIn(false);
      setCheckedInState(true);
      setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      showToast(`GPS validado en geocerca (150m). Seguro activo.`, "success");
    }, 800);
  };

  const handleSimularErrorGPS = () => {
    setCheckedInState(false);
    setGpsErrorState(true);
    showToast("Estás fuera del radio del predio (a 1.4 km de Puerta 4).", "warning");
  };

  const handleAcceptProposal = (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "accepted" } : p))
    );
    showToast("Propuesta aceptada. Ya enviamos tu perfil y talles.", "success");
  };

  const handleRejectProposal = (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p))
    );
    showToast("Propuesta declinada sin penalización en tu score.", "info");
  };

  const staffFirstName = userProfile?.name ? userProfile.name.split(" ")[0] : "Martina";
  const staffAvatar = userProfile?.avatarImg || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80";

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      {/* Saludo & Avatar Header (Descongestionado) */}
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-tight truncate">Hola, {staffFirstName}</h1>
            <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
          </div>
          <p className="font-mono text-[10px] font-semibold text-sky-400 mt-0.5 truncate">
            Perfil verificado • Top 5% Staff
          </p>
        </div>
        <img 
          src={staffAvatar} 
          className="w-10 h-10 rounded-card object-cover shrink-0 border border-sky-400/30" 
        />
      </div>

      {/* Sección Tu Jornada de Hoy */}
      <section className="space-y-2">
        <div className="flex justify-between items-center px-0.5">
          <h2 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Tu Jornada de Hoy
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHasShiftToday(!hasShiftToday)}
              className="text-[10px] text-zinc-400 hover:text-sky-400 transition-colors font-mono"
            >
              {hasShiftToday ? "Ver Estado Vacío" : "Ver Turno Asignado"}
            </button>
            {hasShiftToday && !checkedInState && (
              <button 
                onClick={handleSimularErrorGPS}
                className="text-[10px] font-mono text-zinc-400 hover:text-[#EF4444] transition-colors"
              >
                Simular Error GPS
              </button>
            )}
          </div>
        </div>

        {/* ESTADO VACÍO: Sin Jornadas Asignadas Hoy */}
        {!hasShiftToday ? (
          <div className={`p-5 rounded-hero text-center space-y-3 ${
            isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'
          }`}>
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-sky-400' : 'bg-sky-50 text-sky-600'
            }`}>
              <i className="ph-fill ph-calendar-blank text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Sin jornadas asignadas hoy</h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                No tenés turnos activos para hoy. Tu perfil está visible para convocatorias de productoras en {country}.
              </p>
            </div>

            {/* Barra de Progreso de Verificación */}
            <div className={`p-2.5 rounded-card text-left space-y-1.5 ${isDark ? 'bg-zinc-950' : 'bg-slate-50 border border-slate-200'}`}>
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="font-bold text-sky-400">80% completo</span>
                <span className="text-zinc-400">Falta subir comprobante</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                <div className="w-[80%] h-full bg-sky-400 rounded-full" />
              </div>
            </div>

            <LuminousButton
              icon="ph-shield-check"
              onClick={() => showToast("Disponibilidad activada para reemplazos de último minuto.", "success")}
            >
              Disponible para reemplazos
            </LuminousButton>
          </div>
        ) : (
          /* ESTADO ACTIVO: Hero Card del Turno */
          <div className={`relative rounded-hero overflow-hidden shadow-xl transition-all ${
            isDark ? 'bg-zinc-900' : 'bg-white border border-slate-200/80 shadow-md'
          }`}>
            {/* Banner de Producción */}
            <div className="relative h-28 w-full overflow-hidden">
              <img 
                src={currentEvent.bannerImg} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
              
              <div className="absolute top-2.5 left-2.5">
                <StatusBadge variant={checkedInState ? "success" : "warning"}>
                  {checkedInState ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                      EN TURNO ({checkInTime})
                    </>
                  ) : (
                    "PENDIENTE"
                  )}
                </StatusBadge>
              </div>

              {checkedInState && (
                <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-sky-400 font-mono text-[10px] font-bold">
                  ⏱️ {formatTimer(secondsInShift)}
                </div>
              )}

              <div className="absolute bottom-2 left-3 right-3">
                <h3 className="text-sm font-extrabold text-white tracking-tight truncate">
                  {currentEvent.name}
                </h3>
                <p className="text-[11px] text-zinc-300 font-medium truncate">
                  Anfitriona de Acceso VIP • Puerta 4
                </p>
              </div>
            </div>

            {/* Datos Técnicos del Turno */}
            <div className="p-3.5 space-y-3">
              <div className="space-y-1.5 font-mono text-xs">
                <div className={`p-2 rounded-input flex items-center gap-2 ${
                  isDark ? 'bg-zinc-950/70 text-zinc-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  <i className="ph ph-clock text-sky-400 text-sm shrink-0" />
                  <span className="truncate">14:00 - 22:00 hs (Break 45m)</span>
                </div>
                <div className={`p-2 rounded-input flex items-center gap-2 ${
                  isDark ? 'bg-zinc-950/70 text-zinc-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  <i className="ph ph-map-pin text-sky-400 text-sm shrink-0" />
                  <span className="truncate">{currentEvent.location}</span>
                </div>
              </div>

              {/* Alerta de Error de Geocerca GPS */}
              {gpsErrorState && (
                <div className={`p-2.5 rounded-card space-y-2 animate-fade-in ${
                  isDark ? 'bg-red-950/30 text-red-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <i className="ph-fill ph-warning-octagon text-sm text-[#EF4444]" />
                    <span>Error de ubicación GPS</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    Estás fuera del radio del predio (a 1.4 km de Puerta 4). Acercate para habilitar el fichaje.
                  </p>
                  <button 
                    onClick={handleFicharGPS}
                    className="w-full py-2 rounded-input bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Reintentar ubicación
                  </button>
                </div>
              )}

              {/* Estado Fichaje Exitoso con Botón Fichar Salida */}
              {checkedInState && (
                <div className={`p-2.5 rounded-card space-y-2 animate-fade-in ${
                  isDark ? 'bg-[#34D399]/10 text-zinc-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#34D399] flex items-center gap-1">
                      <i className="ph-fill ph-shield-check" /> Ingreso Registrado
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">Seguro Activo</span>
                  </div>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Fichaje confirmado a las {checkInTime}. Tu liquidación se computará automáticamente al completar el turno.
                  </p>
                  <button
                    onClick={() => {
                      setCheckedInState(false);
                      showToast("Salida registrada. Liquidación enviada a Cobros.", "info");
                    }}
                    className="w-full py-2 rounded-input bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className="ph-bold ph-sign-out" /> Fichar salida
                  </button>
                </div>
              )}

              {/* CTA Principal de Fichaje */}
              {!checkedInState && !gpsErrorState && (
                <LuminousButton
                  icon="ph-navigation-arrow"
                  loading={isCheckingIn}
                  onClick={handleFicharGPS}
                >
                  Fichar Ingreso con GPS
                </LuminousButton>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Sección Propuestas Directas */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center px-0.5">
          <h2 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Propuestas Directas
          </h2>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-400">
            {proposals.filter(p => p.status === 'pending').length} NUEVAS
          </span>
        </div>

        <div className="space-y-3">
          {proposals.map((prop) => (
            <div 
              key={prop.id}
              className={`rounded-card p-3.5 transition-all ${
                isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-1 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-xs truncate">{prop.title}</h3>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-600'} truncate`}>{prop.agency}</p>
                </div>
                <span className="font-mono text-xs font-black text-sky-400 shrink-0">
                  {prop.pay}
                </span>
              </div>

              <div className="space-y-1 font-mono text-[10px] text-zinc-400 mb-3">
                <div className="flex items-center gap-1.5 truncate">
                  <i className="ph ph-calendar text-xs" />
                  <span>{prop.date}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <i className="ph ph-t-shirt text-xs" />
                  <span>{prop.dresscode}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <i className="ph ph-map-pin text-xs text-sky-400" />
                  <span className="truncate">{prop.venue}</span>
                </div>
              </div>

              {/* Botones de Acción */}
              {prop.status === "pending" ? (
                <div className="flex gap-2">
                  <LuminousButton
                    icon="ph-check"
                    onClick={() => handleAcceptProposal(prop.id)}
                    className="flex-1"
                  >
                    Aceptar con mi perfil
                  </LuminousButton>
                  <button
                    onClick={() => handleRejectProposal(prop.id)}
                    className={`px-3 py-2 rounded-input text-xs font-bold border transition-colors shrink-0 ${
                      isDark 
                        ? 'border-zinc-700 text-zinc-400 hover:text-zinc-200' 
                        : 'border-slate-300 text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Rechazar
                  </button>
                </div>
              ) : prop.status === "accepted" ? (
                <div className="p-2 rounded-input bg-[#34D399]/10 text-[#34D399] font-bold text-xs text-center flex items-center justify-center gap-1.5">
                  <i className="ph-fill ph-check-circle" /> Postulación Confirmada
                </div>
              ) : (
                <div className="p-2 rounded-input bg-zinc-800/40 text-zinc-500 font-bold text-xs text-center">
                  Propuesta declinada
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Tab 2: Agenda (Confirmados, Postulados, Historial) ---
const WorkerTabAgenda = () => {
  const { isDark, country } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState("confirmados");

  const agendaItems = {
    confirmados: [
      {
        id: 1,
        title: country === "AR" ? "Lollapalooza 2026 · Día 2" : "Mobile World Congress 2026",
        date: "Sábado 21 Mar • 14:00 hs",
        role: "Promotora VIP",
        venue: country === "AR" ? "Hipódromo de San Isidro" : "Fira Barcelona Gran Via",
        badge: "CONFIRMADO",
        badgeVariant: "success"
      },
      {
        id: 2,
        title: country === "AR" ? "Feria Matear 2026" : "Salón Náutico Internacional",
        date: "Viernes 27 Mar • 10:00 hs",
        role: "Acreditaciones",
        venue: country === "AR" ? "Predio La Rural Palermo" : "Port Vell Barcelona",
        badge: "CONFIRMADO",
        badgeVariant: "success"
      }
    ],
    postulados: [
      {
        id: 3,
        title: country === "AR" ? "Heineken Sunset Session" : "Gastro Festival Madrid",
        date: "Domingo 29 Mar • 18:00 hs",
        role: "Bartender Principal",
        venue: country === "AR" ? "Costanera Norte" : "IFEMA Madrid",
        badge: "EN REVISIÓN",
        badgeVariant: "warning"
      }
    ],
    historial: [
      {
        id: 4,
        title: country === "AR" ? "Maratón Nordelta 2026" : "Sephora Beauty Experience",
        date: "14 Feb 2026",
        role: "Guía de circuito",
        venue: country === "AR" ? "Tigre, Buenos Aires" : "Palau Sant Jordi",
        badge: "COMPLETADO",
        badgeVariant: "accent"
      }
    ]
  };

  const currentList = agendaItems[activeTab] || [];

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Tu Agenda</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Fechas asignadas, postulaciones activas e historial ({country}).
        </p>
      </div>

      {/* Tabs Selector */}
      <div className={`p-1 rounded-card flex gap-1 ${isDark ? 'bg-zinc-900' : 'bg-slate-100'}`}>
        {[
          { key: "confirmados", label: "Confirmados" },
          { key: "postulados", label: "Postulados" },
          { key: "historial", label: "Historial" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-input transition-colors ${
              activeTab === tab.key
                ? isDark ? 'bg-zinc-800 text-sky-400 shadow-sm' : 'bg-white text-sky-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-2.5">
        {currentList.map((item) => (
          <div 
            key={item.id}
            className={`p-3.5 rounded-card space-y-2 ${
              isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-xs truncate">{item.title}</h3>
                <span className="text-[10px] text-zinc-400 font-mono block">{item.role}</span>
              </div>
              <StatusBadge variant={item.badgeVariant}>{item.badge}</StatusBadge>
            </div>

            <div className="space-y-1 font-mono text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <i className="ph ph-calendar text-xs" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ph ph-map-pin text-xs text-sky-400" />
                <span className="truncate">{item.venue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Tab 3: Cobros (Mis Cobros y Liquidaciones) ---
const WorkerTabCobros = () => {
  const { isDark, country, showToast, userProfile } = useContext(AppContext);

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Mis cobros</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Liquidaciones al día con pago garantizado ({country}).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3.5 rounded-card ${isDark ? 'bg-zinc-900 border border-sky-400/30' : 'bg-white border border-sky-600/30 shadow-sm'}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">PENDIENTE</span>
          <span className="font-mono font-extrabold text-sm text-sky-400 block">
            {country === "AR" ? "$120.000" : "€275"}
          </span>
        </div>
        <div className={`p-3.5 rounded-card ${isDark ? 'bg-zinc-900' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">COBRADO (MES)</span>
          <span className="font-mono font-extrabold text-sm text-[#34D399] block">
            {country === "AR" ? "$185.000" : "€420"}
          </span>
        </div>
      </div>

      {/* Detalle por evento */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
          Detalle por evento trabajado
        </span>
        
        <div className={`p-3 rounded-card flex items-center justify-between font-mono text-xs ${
          isDark ? 'bg-zinc-900' : 'bg-white border border-slate-200/80 shadow-sm'
        }`}>
          <div>
            <span className="font-bold block text-zinc-200">
              {country === "AR" ? "Maratón Nordelta" : "Mobile World Congress 2026"}
            </span>
            <span className="text-[10px] text-zinc-400">Hace 3 días • Acreditado</span>
          </div>
          <span className="font-bold text-zinc-100">{country === "AR" ? "$65.000" : "€130"}</span>
        </div>

        <div className={`p-3 rounded-card flex items-center justify-between font-mono text-xs ${
          isDark ? 'bg-zinc-900' : 'bg-white border border-slate-200/80 shadow-sm'
        }`}>
          <div>
            <span className="font-bold block text-zinc-200">
              {country === "AR" ? "Experiencia Nike Run" : "Sephora Beauty Experience"}
            </span>
            <span className="text-[10px] text-sky-400">En proceso de liquidación</span>
          </div>
          <span className="font-bold text-sky-400">{country === "AR" ? "$55.000" : "€145"}</span>
        </div>
      </div>

      {/* Carga de Factura Electrónica */}
      <div className="pt-1">
        <LuminousButton
          icon="ph-receipt"
          onClick={() => showToast(country === 'AR' ? 'Cargando comprobante de Factura AFIP...' : 'Subiendo factura con IRPF/IVA...', 'success')}
        >
          {country === 'AR' ? 'Cargar Factura Electrónica (AFIP)' : 'Subir Factura con IRPF / IVA'}
        </LuminousButton>
      </div>

      {/* Cuenta Bancaria */}
      <div className={`p-3 rounded-card space-y-1 font-mono text-xs ${
        isDark ? 'bg-zinc-950' : 'bg-slate-100'
      }`}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
          CUENTA DE DEPÓSITO ({country})
        </span>
        <div className="flex justify-between items-center">
          <span className={isDark ? 'text-zinc-300' : 'text-slate-800'}>
            {country === 'AR' ? `Alias: ${userProfile?.cbuAlias || 'martina.eventos.mp'}` : `IBAN: ${userProfile?.iban || 'ES82 2100 0418 ****'}`}
          </span>
          <StatusBadge variant="success">Verificada</StatusBadge>
        </div>
      </div>
    </div>
  );
};

// --- Tab 4: Mi Perfil (100% Editable en Estado Local) ---
const WorkerTabMiPerfil = ({ onLogout }) => {
  const { isDark, country, showToast, userProfile, setUserProfile } = useContext(AppContext);

  // 1. Datos personales editables
  const [name, setName] = useState(userProfile?.name || "Martina Benítez");
  const [phone, setPhone] = useState(userProfile?.phone || "+54 9 11 5821-9943");
  const [city, setCity] = useState(userProfile?.city || (country === "AR" ? "Buenos Aires, Palermo" : "Barcelona, Eixample"));
  const [languages, setLanguages] = useState(userProfile?.languages || "Español nativo · Inglés C1");
  const [availability, setAvailability] = useState(userProfile?.availability || "Fines de semana y turnos noche");

  // 2. Fotos verificadas
  const [avatarImg, setAvatarImg] = useState(userProfile?.avatarImg || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80");
  const [fullBodyImg, setFullBodyImg] = useState(userProfile?.fullBodyImg || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80");
  const [shoesImg, setShoesImg] = useState(userProfile?.shoesImg || "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80");

  // 3. Talles y calzado
  const [height, setHeight] = useState(userProfile?.height || "1.74 m");
  const [shirt, setShirt] = useState(userProfile?.shirt || "M");
  const [pant, setPant] = useState(userProfile?.pant || "38");
  const [shoes, setShoes] = useState(userProfile?.shoes || "38");
  const [shoesType, setShoesType] = useState(userProfile?.shoesType || "Botas negras reglamentarias");

  // 4. Documentación y cuenta
  const [dni, setDni] = useState(country === "AR" ? (userProfile?.dniAr || "42.100.892") : (userProfile?.nieEs || "Y-4921028-H"));
  const [cbuAlias, setCbuAlias] = useState(userProfile?.cbuAlias || "martina.eventos.mp");
  const [iban, setIban] = useState(userProfile?.iban || "ES82 2100 0418 4502 0005 1234");

  // 5. Switches de disponibilidad
  const [guard24, setGuard24] = useState(userProfile?.guard24 ?? true);
  const [car, setCar] = useState(userProfile?.car ?? true);

  const [saving, setSaving] = useState(false);

  const handleCyclePhoto = (type) => {
    const photoPool = {
      avatar: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80"
      ],
      body: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80"
      ],
      shoes: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80"
      ]
    };

    if (type === "avatar") {
      const idx = (photoPool.avatar.indexOf(avatarImg) + 1) % photoPool.avatar.length;
      setAvatarImg(photoPool.avatar[idx]);
      showToast("Foto de rostro actualizada.", "info");
    } else if (type === "body") {
      const idx = (photoPool.body.indexOf(fullBodyImg) + 1) % photoPool.body.length;
      setFullBodyImg(photoPool.body[idx]);
      showToast("Foto de cuerpo entero actualizada.", "info");
    } else if (type === "shoes") {
      const idx = (photoPool.shoes.indexOf(shoesImg) + 1) % photoPool.shoes.length;
      setShoesImg(photoPool.shoes[idx]);
      showToast("Foto de calzado reglamentario actualizada.", "info");
    }
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (setUserProfile) {
        setUserProfile(prev => ({
          ...prev,
          name,
          phone,
          city,
          languages,
          availability,
          avatarImg,
          fullBodyImg,
          shoesImg,
          height,
          shirt,
          pant,
          shoes,
          shoesType,
          cbuAlias,
          iban,
          dniAr: country === "AR" ? dni : prev?.dniAr,
          nieEs: country === "ES" ? dni : prev?.nieEs,
          guard24,
          car
        }));
      }
      showToast("Perfil actualizado correctamente.", "success");
    }, 400);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-16">
      {/* Header Mi Perfil */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-extrabold tracking-tight">Mi Perfil</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Datos personales, book, talles y documentación ({country}).
          </p>
        </div>
        <button
          onClick={onLogout}
          className={`px-3 py-1 rounded-card border text-[11px] font-bold flex items-center gap-1 transition-colors ${
            isDark ? 'border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40' : 'border-slate-300 text-slate-700 hover:text-red-600'
          }`}
          title="Cerrar sesión"
        >
          <i className="ph ph-sign-out" /> Salir
        </button>
      </div>

      {/* SECCIÓN 1: Datos Personales */}
      <div className={`p-3.5 rounded-card space-y-3 ${isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
          1. DATOS PERSONALES
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">Nombre completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-10 px-3 text-xs font-semibold rounded-input border outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">Teléfono / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full h-10 px-3 text-xs font-mono font-semibold rounded-input border outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">Ciudad / Zona</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`w-full h-10 px-3 text-xs font-semibold rounded-input border outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">Idiomas</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className={`w-full h-10 px-3 text-xs font-semibold rounded-input border outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                }`}
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-0.5">Disponibilidad horaria</label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={`w-full h-10 px-3 text-xs font-semibold rounded-input border outline-none ${
                  isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Book y Calzado (3 Fotos Verificadas) */}
      <div className={`p-3.5 rounded-card space-y-2.5 ${isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            2. BOOK Y CALZADO (3 FOTOS)
          </span>
          <span className="text-[10px] text-zinc-400">Tocá para cambiar foto</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Rostro */}
          <div 
            onClick={() => handleCyclePhoto("avatar")}
            className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm cursor-pointer group"
          >
            <img src={avatarImg} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">Cambiar</span>
            </div>
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Rostro</span>
          </div>

          {/* Cuerpo */}
          <div 
            onClick={() => handleCyclePhoto("body")}
            className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm cursor-pointer group"
          >
            <img src={fullBodyImg} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">Cambiar</span>
            </div>
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Cuerpo</span>
          </div>

          {/* Calzado */}
          <div 
            onClick={() => handleCyclePhoto("shoes")}
            className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm cursor-pointer group"
          >
            <img src={shoesImg} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded">Cambiar</span>
            </div>
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Calzado</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Talles y Calzado */}
      <div className={`p-3.5 rounded-card space-y-2.5 ${isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
          3. TALLES Y CALZADO
        </span>

        <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block mb-0.5">ALT</span>
            <input 
              value={height} 
              onChange={(e) => setHeight(e.target.value)} 
              className="w-full bg-transparent font-bold text-xs text-center outline-none" 
            />
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block mb-0.5">REM</span>
            <input 
              value={shirt} 
              onChange={(e) => setShirt(e.target.value)} 
              className="w-full bg-transparent font-bold text-xs text-center text-sky-400 outline-none" 
            />
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block mb-0.5">PAN</span>
            <input 
              value={pant} 
              onChange={(e) => setPant(e.target.value)} 
              className="w-full bg-transparent font-bold text-xs text-center outline-none" 
            />
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block mb-0.5">CAL</span>
            <input 
              value={shoes} 
              onChange={(e) => setShoes(e.target.value)} 
              className="w-full bg-transparent font-bold text-xs text-center outline-none" 
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] text-zinc-400 block mb-0.5">Tipo de calzado reglamentario disponible</label>
          <input
            type="text"
            value={shoesType}
            onChange={(e) => setShoesType(e.target.value)}
            className={`w-full h-10 px-3 text-xs font-semibold rounded-input border outline-none ${
              isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* SECCIÓN 4: Documentación y Cobro */}
      <div className={`p-3.5 rounded-card space-y-2.5 ${isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
          4. DOCUMENTACIÓN Y COBRO ({country})
        </span>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">
              {country === "AR" ? "DNI / CUIL" : "DNI / NIE"}
            </label>
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className={`w-full h-10 px-3 text-xs font-mono font-semibold rounded-input border outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 block mb-0.5">
              {country === "AR" ? "CBU / Alias para depósitos" : "IBAN bancario europeo"}
            </label>
            <input
              type="text"
              value={country === "AR" ? cbuAlias : iban}
              onChange={(e) => country === "AR" ? setCbuAlias(e.target.value) : setIban(e.target.value)}
              className={`w-full h-10 px-3 text-xs font-mono font-semibold rounded-input border outline-none ${
                isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className={`p-2.5 rounded-card flex items-center justify-between text-xs font-mono ${
              isDark ? 'bg-zinc-950' : 'bg-slate-100'
            }`}>
              <span>{country === "AR" ? "Constancia Monotributo AFIP" : "Alta Seguridad Social"}</span>
              <StatusBadge variant="success">Al día</StatusBadge>
            </div>
            <div className={`p-2.5 rounded-card flex items-center justify-between text-xs font-mono ${
              isDark ? 'bg-zinc-950' : 'bg-slate-100'
            }`}>
              <span>{country === "AR" ? "Póliza AP / Cláusula no repetición" : "Certificado Prevención Riesgos"}</span>
              <StatusBadge variant="success">Vigente</StatusBadge>
            </div>
          </div>

          <button
            onClick={() => showToast("Subida de constancia legal habilitada.", "info")}
            className={`w-full py-2 rounded-input border text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <i className="ph ph-upload-simple text-sm" /> Subir constancia actualizada
          </button>
        </div>
      </div>

      {/* SECCIÓN 5: Disponibilidad Operativa */}
      <div className={`p-3.5 rounded-card space-y-2.5 ${isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'}`}>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
          5. DISPONIBILIDAD OPERATIVA
        </span>

        <div className="space-y-2">
          <div 
            onClick={() => setGuard24(!guard24)}
            className={`p-3 rounded-card flex items-center justify-between cursor-pointer border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold">Disponible para reemplazos</h4>
              <p className="text-[10px] text-zinc-400">Recibí convocatorias urgentes con plus de tarifa</p>
            </div>
            <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${guard24 ? 'bg-sky-400' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${guard24 ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </div>

          <div 
            onClick={() => setCar(!car)}
            className={`p-3 rounded-card flex items-center justify-between cursor-pointer border ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <h4 className="text-xs font-bold">Movilidad propia (Auto / Moto)</h4>
              <p className="text-[10px] text-zinc-400">Prioridad en eventos de predios alejados</p>
            </div>
            <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${car ? 'bg-sky-400' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${car ? 'translate-x-3' : 'translate-x-0'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Botón Guardar Cambios (Fitts Law) */}
      <div className="pt-2">
        <LuminousButton
          icon="ph-floppy-disk"
          loading={saving}
          onClick={handleSaveProfile}
        >
          Guardar cambios en mi perfil
        </LuminousButton>
      </div>
    </div>
  );
};
