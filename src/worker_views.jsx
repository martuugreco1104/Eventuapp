// Vistas de Staff (B2C): Inicio, Agenda, Cobros, Mi Perfil

const WorkerTabInicio = ({ currentEvent }) => {
  const { isDark, showToast, country } = useContext(AppContext);
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
      showToast(`GPS validado en Puerta 4. Seguro activo y geocerca confirmada.`, "success");
    }, 800);
  };

  const handleSimularErrorGPS = () => {
    setCheckedInState(false);
    setGpsErrorState(true);
    showToast("Error de Geocerca GPS: Te encontrás a 420m de Puerta 4.", "warning");
  };

  const handleAcceptProposal = (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "accepted" } : p))
    );
    showToast("¡Propuesta aceptada! Perfil y medidas enviados a la agencia.", "success");
  };

  const handleRejectProposal = (id) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "rejected" } : p))
    );
    showToast("Propuesta declinada sin penalización en tu score.", "info");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      {/* Saludo & Avatar Header */}
      <div className="flex justify-between items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-tight truncate">Hola, Martina</h1>
            <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
          </div>
          <p className="font-mono text-[10px] font-semibold text-sky-400 mt-0.5 truncate">
            Perfil verificado • Top 5% Staff ({country})
          </p>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" 
          className="w-10 h-10 rounded-card object-cover border border-zinc-700 shrink-0" 
        />
      </div>

      {/* Sección Tu Jornada de Hoy */}
      <section>
        <div className="flex justify-between items-center mb-1.5">
          <h2 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
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
          <div className={`p-5 rounded-hero border text-center space-y-3 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
              isDark ? 'bg-zinc-800 text-sky-400' : 'bg-sky-50 text-sky-600'
            }`}>
              <i className="ph-fill ph-calendar-blank text-2xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Sin jornadas asignadas hoy</h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                No tenés turnos activos para hoy en {country}. Activá tu Guardia 24h para recibir convocatorias de emergencia o postulate a las propuestas de abajo.
              </p>
            </div>
            <LuminousButton
              icon="ph-shield-check"
              onClick={() => showToast("Guardia 24h activada. Tu perfil está primero en el radar de emergencias.", "success")}
            >
              Activar Guardia 24h Smart Backup
            </LuminousButton>
          </div>
        ) : (
          /* ESTADO ACTIVO: Hero Card del Turno */
          <div className={`relative rounded-hero overflow-hidden border shadow-xl transition-all ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
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
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-sky-400 font-mono text-[10px] font-bold">
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
                <div className={`p-2 rounded-input flex items-center gap-2 border ${
                  isDark ? 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <i className="ph ph-clock text-sky-400 text-sm shrink-0" />
                  <span className="truncate">14:00 - 22:00 hs (Break 45m)</span>
                </div>
                <div className={`p-2 rounded-input flex items-center gap-2 border ${
                  isDark ? 'bg-zinc-950/70 border-zinc-800/80 text-zinc-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <i className="ph ph-map-pin text-sky-400 text-sm shrink-0" />
                  <span className="truncate">{currentEvent.location}</span>
                </div>
              </div>

              {/* Alerta de Error de Geocerca GPS */}
              {gpsErrorState && (
                <div className={`p-2.5 rounded-card border space-y-2 animate-fade-in ${
                  isDark ? 'bg-red-950/30 border-red-800/50 text-red-300' : 'bg-rose-50 border-rose-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <i className="ph-fill ph-warning-octagon text-sm text-[#EF4444]" />
                    <span>Error de Geocerca GPS</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    Te encontrás a 420m del predio. Acercate a Puerta 4 para habilitar el fichaje de ingreso.
                  </p>
                  <button 
                    onClick={handleFicharGPS}
                    className="w-full py-1.5 rounded-input bg-[#EF4444] text-white text-[11px] font-bold"
                  >
                    Reintentar Detección GPS
                  </button>
                </div>
              )}

              {/* Estado Fichaje Exitoso */}
              {checkedInState && (
                <div className={`p-2.5 rounded-card border space-y-1.5 animate-fade-in ${
                  isDark ? 'bg-[#34D399]/10 border-[#34D399]/30' : 'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[#34D399] flex items-center gap-1">
                      <i className="ph-fill ph-shield-check" /> Ingreso Registrado
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">Seguro AP Activo</span>
                  </div>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                    Fichaje confirmado a las {checkInTime}. Tu liquidación se computará automáticamente al completar el turno.
                  </p>
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
      <section className="space-y-2">
        <div className="flex justify-between items-center px-0.5">
          <h2 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Propuestas Directas
          </h2>
          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-400/10 text-sky-400">
            {proposals.filter(p => p.status === 'pending').length} NUEVAS
          </span>
        </div>

        <div className="space-y-2.5">
          {proposals.map((prop) => (
            <div 
              key={prop.id}
              className={`border rounded-card p-3 transition-all ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start gap-1 mb-1.5">
                <div className="min-w-0">
                  <h3 className="font-bold text-xs truncate">{prop.title}</h3>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'} truncate`}>{prop.agency}</p>
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
                    Aceptar con mi Perfil
                  </LuminousButton>
                  <button 
                    onClick={() => handleRejectProposal(prop.id)}
                    className={`px-3 h-12 rounded-input border text-xs font-bold transition-colors shrink-0 ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between font-mono text-[10px]">
                  <StatusBadge variant={prop.status === "accepted" ? "success" : "neutral"}>
                    {prop.status === "accepted" ? "Propuesta Confirmada" : "Declinada"}
                  </StatusBadge>
                  <span className="text-zinc-500">Respondido</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- Tab 2: Agenda (Mis Fechas) ---
const WorkerTabAgenda = () => {
  const { isDark, country, showToast } = useContext(AppContext);
  const [agendaTab, setAgendaTab] = useState("Confirmados");

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Mis fechas</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Calendario operativo y logística de eventos confirmados ({country}).
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto hide-scroll pb-1">
        {["Confirmados", "Postulados", "Historial"].map((tab) => (
          <button
            key={tab}
            onClick={() => setAgendaTab(tab)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ${
              agendaTab === tab
                ? 'bg-sky-400 text-zinc-950 border-sky-400 font-bold'
                : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {/* Evento Confirmado */}
        <div className={`p-3 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="text-xs font-bold">
                {country === "AR" ? "Lollapalooza 2026" : "Mobile World Congress 2026"}
              </h4>
              <span className="text-[10px] text-zinc-400 font-mono">
                {country === "AR" ? "Sáb 28 Nov · 14:00 hs" : "Lun 2 Mar · 09:00 hs"}
              </span>
            </div>
            <StatusBadge variant="success">Confirmado</StatusBadge>
          </div>
          <button 
            onClick={() => showToast("Abriendo navegación en Google Maps...", "info")}
            className="w-full h-10 rounded-input border border-zinc-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors"
          >
            <i className="ph-fill ph-navigation-arrow text-sky-400" /> Cómo llegar al Venue
          </button>
        </div>

        {/* Coordinadora en Venue */}
        <div className={`p-3 rounded-card border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
            COORDINADORA EN VENUE
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80" 
                className="w-8 h-8 rounded-full object-cover" 
              />
              <div>
                <h5 className="text-xs font-bold">
                  {country === "AR" ? "Florencia V. (Agencia DER)" : "Marta S. (NSH Azafatas BCN)"}
                </h5>
                <span className="text-[10px] text-zinc-400">
                  {country === "AR" ? "En Puerta 4 Staff" : "En Pabellón 3 Acceso Norte"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => showToast("Abriendo chat directo con la coordinadora...", "info")}
              className="px-2.5 py-1 rounded-input bg-sky-400/20 text-sky-400 border border-sky-400/30 text-[11px] font-bold"
            >
              Contactar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Tab 3: Cobros (Centro Financiero) ---
const WorkerTabCobros = () => {
  const { isDark, country, showToast } = useContext(AppContext);

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Cobros • Centro financiero</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Liquidaciones al día con pago garantizado ({country}).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-card border ${isDark ? 'bg-zinc-900 border-sky-400/30' : 'bg-white border-sky-600/30 shadow-sm'}`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">PENDIENTE</span>
          <span className="font-mono font-extrabold text-sm text-sky-400 block">
            {country === "AR" ? "$120.000" : "€275"}
          </span>
        </div>
        <div className={`p-3 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
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
        
        <div className={`p-2.5 rounded-card border flex items-center justify-between font-mono text-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div>
            <span className="font-bold block text-zinc-200">
              {country === "AR" ? "Maratón Nordelta" : "Mobile World Congress 2026"}
            </span>
            <span className="text-[10px] text-zinc-400">Hace 3 días • Acreditado</span>
          </div>
          <span className="font-bold text-zinc-100">{country === "AR" ? "$65.000" : "€130"}</span>
        </div>

        <div className={`p-2.5 rounded-card border flex items-center justify-between font-mono text-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
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
      <div className={`p-3 rounded-card border space-y-1 font-mono text-xs ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
          CUENTA DE DEPÓSITO
        </span>
        <div className="flex justify-between items-center">
          <span className="text-zinc-300">
            {country === 'AR' ? 'Alias: martina.staff.mp' : 'IBAN: ES91 2100 0418 4502 ****'}
          </span>
          <StatusBadge variant="success">Verificada</StatusBadge>
        </div>
      </div>
    </div>
  );
};

// --- Tab 4: Mi Perfil (Medidas, Fotos & Bóveda Legal) ---
const WorkerTabMiPerfil = ({ onLogout }) => {
  const { isDark, country, showToast } = useContext(AppContext);
  const [guard24, setGuard24] = useState(true);
  const [car, setCar] = useState(true);

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-extrabold tracking-tight">Mi Perfil</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Medidas, fotos verificadas y bóveda legal ({country}).
          </p>
        </div>
        <button
          onClick={onLogout}
          className={`px-2.5 py-1 rounded-card border text-[11px] font-bold flex items-center gap-1 transition-colors ${
            isDark ? 'border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40' : 'border-slate-300 text-slate-600 hover:text-red-600'
          }`}
          title="Cerrar sesión"
        >
          <i className="ph ph-sign-out" /> Salir
        </button>
      </div>

      {/* 3 Fotos Verificadas */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
          Fotos de Perfil Verificadas (3)
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-card overflow-hidden border border-zinc-700/50 aspect-[3/4] relative">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white">Rostro</span>
          </div>
          <div className="rounded-card overflow-hidden border border-zinc-700/50 aspect-[3/4] relative">
            <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white">Cuerpo</span>
          </div>
          <div className="rounded-card overflow-hidden border border-zinc-700/50 aspect-[3/4] relative">
            <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-bold text-white">Calzado</span>
          </div>
        </div>
      </div>

      {/* Medidas de Guardarropa */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
          Medidas de Guardarropa
        </span>
        <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block">ALT</span>
            <span className="font-bold text-xs">1.74 m</span>
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block">REM</span>
            <span className="font-bold text-xs text-sky-400">M</span>
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block">PAN</span>
            <span className="font-bold text-xs">38</span>
          </div>
          <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
            <span className="text-[9px] text-zinc-400 block">CAL</span>
            <span className="font-bold text-xs">38</span>
          </div>
        </div>
      </div>

      {/* Bóveda Legal */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
          BÓVEDA LEGAL ({country})
        </span>
        <div className="space-y-1.5">
          <div className={`p-2 rounded-card border flex items-center justify-between text-xs font-mono ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <span>{country === "AR" ? "DNI / CUIL: 42.100.892" : "DNI / NIE: Y-4921028-H"}</span>
            <StatusBadge variant="success">Vigente</StatusBadge>
          </div>
          <div className={`p-2 rounded-card border flex items-center justify-between text-xs font-mono ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <span>{country === "AR" ? "Monotributo: Al día" : "Seguridad Social: Alta activa"}</span>
            <StatusBadge variant="success">Verificado</StatusBadge>
          </div>
          <div className={`p-2 rounded-card border flex items-center justify-between text-xs font-mono ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}>
            <span>{country === "AR" ? "Póliza AP: Cláusula No Rep." : "Certificado PRL: Apto"}</span>
            <StatusBadge variant="success">Vigente</StatusBadge>
          </div>
        </div>
      </div>

      {/* Switches Interactivos */}
      <div className="space-y-2">
        <div 
          onClick={() => {
            setGuard24(!guard24);
            showToast(guard24 ? "Guardia 24h pausada." : "Guardia 24h activada.", "info");
          }}
          className={`p-2.5 rounded-card border flex items-center justify-between cursor-pointer ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-bold">Guardia 24h Smart Backup</span>
          <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${guard24 ? 'bg-sky-400' : 'bg-zinc-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${guard24 ? 'translate-x-3' : 'translate-x-0'}`} />
          </div>
        </div>

        <div 
          onClick={() => {
            setCar(!car);
            showToast(car ? "Movilidad propia desactivada." : "Movilidad propia activada.", "info");
          }}
          className={`p-2.5 rounded-card border flex items-center justify-between cursor-pointer ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'
          }`}
        >
          <span className="text-xs font-bold">Movilidad Propia</span>
          <div className={`w-8 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${car ? 'bg-sky-400' : 'bg-zinc-700'}`}>
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${car ? 'translate-x-3' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
