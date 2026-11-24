// Vistas completas de Productora (B2B): Evento, Fechas, Talento, Avisos

const AgencyTabEvento = ({
  currentEvent,
  eventsList,
  onSelectEvent,
  onSmartBackupApplied
}) => {
  const { isDark, showToast, country } = useContext(AppContext);
  const [activeRoleTab, setActiveRoleTab] = useState("Promotores");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [nominaSheetOpen, setNominaSheetOpen] = useState(false);
  const [aiCopilotSheetOpen, setAiCopilotSheetOpen] = useState(false);
  const [eventSwitcherOpen, setEventSwitcherOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFoundProfiles, setAiFoundProfiles] = useState(null);
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [scannedCandidate, setScannedCandidate] = useState(null);

  const roleTabs = ["Promotores", "Acreditaciones", "Barras", "Montaje"];
  const statusChips = ["Todos", "Check-in", "Confirmados", "Guardia 24h", "Baja"];

  // Filtro de Rol y Estado
  const filteredWorkers = currentEvent.workers.filter(w => {
    const roleMatches = w.role === activeRoleTab;
    if (!roleMatches) return false;
    
    if (statusFilter === "Todos") return true;
    if (statusFilter === "Check-in") return w.status.includes("IN");
    if (statusFilter === "Confirmados") return w.status === "Confirmados";
    if (statusFilter === "Guardia 24h") return w.status === "Guardia 24h";
    if (statusFilter === "Baja") return w.status === "Baja";
    return true;
  });

  const handleExportNomina = () => {
    setNominaSheetOpen(false);
    showToast(`Nómina legal oficial generada: ${currentEvent.nominaExportName}`, "success");
  };

  const handleExecuteAISearch = (customQuery) => {
    const queryToUse = customQuery || aiQuery;
    if (!queryToUse.trim()) return;
    setAiQuery(queryToUse);
    setAiLoading(true);
    setAiFoundProfiles(null);

    setTimeout(() => {
      setAiLoading(false);
      setAiFoundProfiles([
        {
          id: 801,
          name: country === "AR" ? "Camila Navarro" : "Laia Ferrer",
          match: 98,
          distance: "2.1 km",
          shirtSize: "M",
          shoes: "Botas reglamentarias",
          docStatus: "ok",
          badges: ["Docs Vigentes", "< 3km", country === "AR" ? "Bilingüe EN" : "Trilingüe EN/FR"],
          img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80"
        },
        {
          id: 802,
          name: country === "AR" ? "Tomás Peralta" : "Javier Maza",
          match: 94,
          distance: "3.8 km",
          shirtSize: "L",
          shoes: "Mocasines negros",
          docStatus: "ok",
          badges: ["Docs Vigentes", "Movilidad", "Guardia 24h"],
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80"
        }
      ]);
      showToast("Copiloto IA: 2 candidatos compatibles encontrados.", "info");
    }, 600);
  };

  const handleStartRadarScan = (worker) => {
    setIsScanningRadar(true);
    setScannedCandidate(null);
    setTimeout(() => {
      setIsScanningRadar(false);
      const countryDB = SMART_BACKUP_DATABASE[country] || SMART_BACKUP_DATABASE["AR"];
      const backup = countryDB[worker.shirtSize] || countryDB["M"];
      setScannedCandidate(backup);
      showToast(`Radar IA: Suplente de guardia ${backup.name} ubicada a ${backup.dist}.`, "warning");
    }, 900);
  };

  const handleConfirmSmartBackup = () => {
    if (!selectedWorker || !scannedCandidate) return;
    onSmartBackupApplied(selectedWorker.id, scannedCandidate);
    setSelectedWorker(null);
    setScannedCandidate(null);
    showToast(`Reemplazo confirmado: ${scannedCandidate.name} ingresa como titular.`, "success");
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Sticky Top Header con Switcher de Evento */}
      <div className={`pt-3 px-4 pb-2.5 sticky top-0 z-20 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-zinc-950/95 border-zinc-800/60' : 'bg-slate-50/95 border-slate-200/80'
      }`}>
        <div className="flex justify-between items-center mb-2.5">
          {/* Selector de Evento Activo */}
          <div 
            onClick={() => setEventSwitcherOpen(true)}
            className="min-w-0 flex-1 mr-2 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="text-sm font-extrabold tracking-tight truncate group-hover:text-sky-400 transition-colors">
                {currentEvent.name}
              </h1>
              <i className="ph-bold ph-caret-down text-xs text-sky-400 shrink-0" />
              <StatusBadge variant="accent">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                VIVO
              </StatusBadge>
            </div>
            <p className={`text-[10px] flex items-center gap-1 font-medium truncate ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              <i className="ph ph-map-pin text-sky-400" /> {currentEvent.location}
            </p>
          </div>

          {/* Botón Nómina Legal */}
          <button
            onClick={() => setNominaSheetOpen(true)}
            className={`h-8 px-3 rounded-card border flex items-center gap-1.5 text-[11px] font-bold transition-all active:scale-95 shrink-0 ${
              isDark ? 'bg-zinc-900 border-zinc-700/70 text-sky-400 hover:bg-zinc-800' : 'bg-white border-slate-300 text-sky-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            <i className="ph-fill ph-shield-check text-sm" />
            <span>Nómina</span>
          </button>
        </div>

        {/* Carrusel de Roles con Cupos en Vivo */}
        <div className="w-full overflow-x-auto hide-scroll flex flex-nowrap items-center gap-2 pb-1.5">
          {roleTabs.map((role) => {
            const roleWorkers = currentEvent.workers.filter(w => w.role === role);
            const activeCount = roleWorkers.filter(w => w.status !== "Baja").length;
            const totalTarget = currentEvent.staffCounts[role]?.total || 10;
            const isFull = activeCount >= totalTarget;
            const isActive = activeRoleTab === role;
            const pct = Math.min((activeCount / totalTarget) * 100, 100);

            return (
              <button
                key={role}
                onClick={() => {
                  setActiveRoleTab(role);
                  setStatusFilter("Todos");
                }}
                className={`shrink-0 px-3 py-1.5 rounded-card border text-[11px] font-semibold transition-all flex flex-col gap-1 ${
                  isActive 
                    ? isDark ? 'bg-zinc-900 border-zinc-700 shadow-sm' : 'bg-white border-slate-300 shadow-sm'
                    : 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex justify-between items-center w-full gap-2">
                  <span className={isActive ? (isDark ? 'text-zinc-100 font-bold' : 'text-slate-900 font-bold') : (isDark ? 'text-zinc-400' : 'text-slate-600')}>
                    {role}
                  </span>
                  <span className={`font-mono text-[10px] font-bold px-1 rounded ${
                    isFull 
                      ? isDark ? 'bg-[#34D399]/15 text-[#34D399]' : 'bg-[#059669]/15 text-[#059669]'
                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {activeCount}/{totalTarget}
                  </span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${isFull ? (isDark ? 'bg-[#34D399]' : 'bg-[#059669]') : (isDark ? 'bg-sky-400' : 'bg-sky-600')}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Filtros de Estado (Chips) */}
        <div className="flex gap-1.5 overflow-x-auto hide-scroll pt-1">
          {statusChips.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-sky-400 text-zinc-950 border-sky-400'
                  : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content List con espaciado amplio y aire */}
      <div className="p-4 space-y-4">
        {/* Trigger Copiloto IA Card */}
        <div 
          onClick={() => setAiCopilotSheetOpen(true)}
          className={`rounded-card p-3 flex items-center gap-3 shadow-sm cursor-pointer transition-all active:scale-[0.99] group ${
            isDark ? 'bg-zinc-900 hover:bg-zinc-800/80' : 'bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm'
          }`}
        >
          <div className={`w-9 h-9 rounded-input flex items-center justify-center shrink-0 ${
            isDark ? 'bg-sky-400/15 text-sky-400 shadow-glow-sky-subtle' : 'bg-sky-50 text-sky-600'
          }`}>
            <i className="ph-fill ph-sparkle text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold tracking-tight truncate">Copiloto IA de Staffing</h2>
              <span className="font-mono text-[9px] font-bold px-1 rounded bg-sky-400/10 text-sky-400 border border-sky-400/20">
                PROMPT
              </span>
            </div>
            <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              "✨ Talle M/L + Botas negras + &lt; 5km..."
            </p>
          </div>
          <i className="ph ph-caret-right text-zinc-500 text-xs" />
        </div>

        {/* Staff Cards List (Sin bordes excesivos, superficie limpia) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center px-0.5">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              {activeRoleTab} ({filteredWorkers.length})
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              Filtro: {statusFilter}
            </span>
          </div>

          {filteredWorkers.length === 0 ? (
            <div className={`p-8 rounded-card text-center space-y-2 ${isDark ? 'bg-zinc-900/40' : 'bg-slate-50'}`}>
              <i className="ph ph-users text-2xl text-zinc-500" />
              <p className="text-xs font-bold">No hay staff con estado "{statusFilter}"</p>
              <button 
                onClick={() => setStatusFilter("Todos")}
                className="text-xs text-sky-400 font-bold hover:underline"
              >
                Ver todos en {activeRoleTab}
              </button>
            </div>
          ) : (
            filteredWorkers.map((worker) => {
              const isCheckedIn = worker.status.includes("IN");
              const isBaja = worker.status === "Baja";
              const isGuard = worker.status === "Guardia 24h";

              return (
                <div
                  key={worker.id}
                  onClick={() => {
                    setSelectedWorker(worker);
                    setScannedCandidate(null);
                  }}
                  className={`rounded-card p-3 flex gap-3 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden ${
                    isBaja 
                      ? isDark ? 'bg-red-950/20 opacity-75' : 'bg-rose-50/70 opacity-75'
                      : isDark ? 'bg-zinc-900 hover:bg-zinc-800/80 shadow-sm' : 'bg-white hover:bg-slate-50 shadow-sm border border-slate-200/60'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img 
                      src={worker.img} 
                      alt={worker.name} 
                      className="w-12 h-12 rounded-card object-cover"
                    />
                    {isCheckedIn && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#34D399] border-2 border-zinc-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs truncate">{worker.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-zinc-400">
                          <span>Talle {worker.shirtSize}</span>
                          <span>•</span>
                          <span>{worker.dist}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge variant={
                          isBaja ? "danger" : isCheckedIn ? "success" : isGuard ? "info" : "warning"
                        }>
                          {worker.status}
                        </StatusBadge>
                        <span className="font-mono text-[10px] font-bold text-sky-400">
                          {worker.score}% Match
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 font-mono text-[10px] text-zinc-400">
                      <span className="truncate pr-1">{worker.footwearType}</span>
                      <span className={`shrink-0 font-bold ${worker.docStatus === 'ok' ? 'text-[#34D399]' : 'text-[#F97316]'}`}>
                        {worker.docStatus === 'ok' ? 'Docs OK' : 'Falta Doc'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL 1: Switcher de Producción / Evento */}
      <BottomSheet
        isOpen={eventSwitcherOpen}
        onClose={() => setEventSwitcherOpen(false)}
        title={`Producciones Activas (${country})`}
      >
        <div className="space-y-2.5">
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Seleccioná la producción para ver cupos en vivo y nómina legal correspondiente:
          </p>
          {eventsList.map((ev) => (
            <div
              key={ev.id}
              onClick={() => {
                onSelectEvent(ev.id);
                setEventSwitcherOpen(false);
                showToast(`Cambiando a producción: ${ev.name}`, "info");
              }}
              className={`p-3 rounded-card flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                ev.id === currentEvent.id 
                  ? isDark ? 'bg-sky-400/15 text-sky-400 font-bold' : 'bg-sky-50 text-sky-700 font-bold border border-sky-300'
                  : isDark ? 'bg-zinc-950 hover:bg-zinc-800' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <div className="min-w-0 pr-2">
                <h4 className="text-xs font-bold truncate">{ev.name}</h4>
                <p className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">{ev.location}</p>
              </div>
              <StatusBadge variant={ev.id === currentEvent.id ? "accent" : "neutral"}>
                {ev.id === currentEvent.id ? "ACTIVO" : "VER"}
              </StatusBadge>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* MODAL 2: Nómina Legal de Ingreso & Seguros */}
      <BottomSheet
        isOpen={nominaSheetOpen}
        onClose={() => setNominaSheetOpen(false)}
        title="Nómina Legal & Pólizas de Ingreso"
      >
        <div className="space-y-3.5">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-xs font-bold">{currentEvent.name}</h4>
              <p className="text-[10px] font-mono text-zinc-400">{currentEvent.legalDocLabel}</p>
            </div>
            <StatusBadge variant="success">100% Cobertura</StatusBadge>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto hide-scroll">
            {currentEvent.workers.map((w) => (
              <div key={w.id} className={`p-2.5 rounded-card flex items-center justify-between font-mono text-xs ${
                isDark ? 'bg-zinc-950' : 'bg-slate-50 border border-slate-200'
              }`}>
                <div className="min-w-0 pr-2">
                  <span className="font-bold block truncate">{w.name} ({w.role})</span>
                  <span className="text-[9px] text-zinc-400 block truncate">{w.dniNie} • {w.insuranceName}</span>
                </div>
                <StatusBadge variant={w.docStatus === 'ok' ? 'success' : 'warning'}>
                  {w.docStatus === 'ok' ? 'Aprobado' : 'Pendiente'}
                </StatusBadge>
              </div>
            ))}
          </div>

          <LuminousButton
            icon="ph-download-simple"
            onClick={handleExportNomina}
          >
            Exportar Nómina Oficial PDF ({currentEvent.currency})
          </LuminousButton>
        </div>
      </BottomSheet>

      {/* MODAL 3: Copiloto IA de Staffing */}
      <BottomSheet
        isOpen={aiCopilotSheetOpen}
        onClose={() => {
          setAiCopilotSheetOpen(false);
          setAiFoundProfiles(null);
        }}
        title="Copiloto IA de Staffing"
      >
        <div className="space-y-3.5">
          <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
            Búsqueda semántica sobre el pool de talentos de {country}:
          </p>

          <div className="flex gap-2">
            <input 
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ej: Azafata bilingüe con mocasines talle M..."
              className={`flex-1 h-11 px-3 text-xs rounded-input border outline-none font-medium ${
                isDark ? 'bg-zinc-950 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-slate-50 border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
            <button
              onClick={() => handleExecuteAISearch()}
              className="px-3 h-11 rounded-input bg-sky-400 text-zinc-950 font-bold text-xs flex items-center gap-1 shrink-0 shadow-glow-sky-subtle"
            >
              <i className="ph-bold ph-magnifying-glass" /> Buscar
            </button>
          </div>

          {/* Quick Prompts */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              PROMPTS RÁPIDOS SUGERIDOS
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button 
                onClick={() => handleExecuteAISearch("Talle M/L con calzado reglamentario a < 3km")}
                className={`p-2 rounded-input border text-left text-xs font-medium transition-colors truncate ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                ✨ Talle M + Botas negras
              </button>
              <button 
                onClick={() => handleExecuteAISearch("Azafata bilingüe protocolo VIP")}
                className={`p-2 rounded-input border text-left text-xs font-medium transition-colors truncate ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                ✨ Azafata bilingüe VIP
              </button>
            </div>
          </div>

          {/* Loading */}
          {aiLoading && (
            <div className="py-4 text-center flex flex-col items-center gap-1.5">
              <i className="ph ph-spinner-gap animate-spin text-2xl text-sky-400" />
              <span className="text-[11px] font-mono text-zinc-400">Filtrando base de datos...</span>
            </div>
          )}

          {/* Results */}
          {aiFoundProfiles && !aiLoading && (
            <div className="space-y-2 pt-1 animate-fade-in">
              {aiFoundProfiles.map((cand) => (
                <div key={cand.id} className={`p-3 rounded-card ${isDark ? 'bg-zinc-950' : 'bg-slate-50 border border-slate-200'}`}>
                  <div className="flex gap-2.5 items-center mb-2">
                    <img src={cand.img} className="w-10 h-10 rounded-card object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs truncate">{cand.name}</h4>
                        <span className="font-mono text-xs font-bold text-sky-400">{cand.match}% Match</span>
                      </div>
                      <span className="font-mono text-[9px] text-zinc-400 block truncate">
                        {cand.distance} • Talle {cand.shirtSize} • {cand.shoes}
                      </span>
                    </div>
                  </div>
                  <LuminousButton
                    icon="ph-paper-plane-tilt"
                    onClick={() => {
                      setAiCopilotSheetOpen(false);
                      showToast(`Propuesta directa enviada a ${cand.name}.`, "success");
                    }}
                  >
                    Enviar Propuesta Directa
                  </LuminousButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* MODAL 4: Ficha Operativa & Smart Backup Radar */}
      <BottomSheet
        isOpen={!!selectedWorker}
        onClose={() => {
          setSelectedWorker(null);
          setScannedCandidate(null);
          setIsScanningRadar(false);
        }}
        title="Ficha Operativa & Guardarropa"
      >
        {selectedWorker && (
          <div className="space-y-4">
            {/* Header Trabajador */}
            <div className="flex gap-3 items-center">
              <img 
                src={selectedWorker.img} 
                className="w-13 h-13 rounded-card object-cover shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold tracking-tight truncate">{selectedWorker.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge variant="accent">
                    <span className="font-mono">{selectedWorker.score}% Match</span>
                  </StatusBadge>
                  <span className="font-mono text-[11px] text-sky-400 flex items-center gap-1 font-semibold">
                    <i className="ph-fill ph-navigation-arrow" /> {selectedWorker.dist}
                  </span>
                </div>
              </div>
            </div>

            {/* Medidas de Guardarropa (4) */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Medidas para Guardarropa
              </span>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                <div className={`p-2 rounded-card ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                  <span className="text-[9px] text-zinc-400 block">ALTURA</span>
                  <span className="font-bold text-xs">{selectedWorker.height}</span>
                </div>
                <div className={`p-2 rounded-card ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                  <span className="text-[9px] text-zinc-400 block">REMERA</span>
                  <span className="font-bold text-xs text-sky-400">{selectedWorker.shirtSize}</span>
                </div>
                <div className={`p-2 rounded-card ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                  <span className="text-[9px] text-zinc-400 block">PANTALÓN</span>
                  <span className="font-bold text-xs">{selectedWorker.pantSize}</span>
                </div>
                <div className={`p-2 rounded-card ${isDark ? 'bg-zinc-950' : 'bg-slate-100'}`}>
                  <span className="text-[9px] text-zinc-400 block">CALZADO</span>
                  <span className="font-bold text-xs">{selectedWorker.shoeSize}</span>
                </div>
              </div>
            </div>

            {/* Book & Calzado Verificado (3 Fotos) */}
            <div>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Book & Calzado Verificado (3 Fotos)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm">
                  <img src={selectedWorker.img} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Rostro</span>
                </div>
                <div className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm">
                  <img src={selectedWorker.fullBodyImg} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Cuerpo</span>
                </div>
                <div className="rounded-card overflow-hidden aspect-[3/4] relative shadow-sm">
                  <img src={selectedWorker.shoesImg} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white">Calzado</span>
                </div>
              </div>
            </div>

            {/* Documentación Legal */}
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Documentación Legal ({country})
              </span>
              <div className={`p-2.5 rounded-card flex items-center justify-between text-xs font-mono ${
                isDark ? 'bg-zinc-950' : 'bg-slate-100'
              }`}>
                <div className="min-w-0 pr-2">
                  <span className="font-bold block truncate">{selectedWorker.dniNie}</span>
                  <span className="text-[9px] text-zinc-400 block truncate">{selectedWorker.insuranceName}</span>
                </div>
                <StatusBadge variant={selectedWorker.docStatus === 'ok' ? 'success' : 'warning'}>
                  {selectedWorker.docStatus === 'ok' ? 'Vigente' : 'Pendiente'}
                </StatusBadge>
              </div>
            </div>

            {/* Reportar Baja & Radar Smart Backup */}
            <div className="pt-2 border-t border-zinc-800/60 space-y-2">
              {!scannedCandidate && !isScanningRadar && (
                <LuminousButton
                  variant="danger"
                  icon="ph-warning-octagon"
                  onClick={() => handleStartRadarScan(selectedWorker)}
                >
                  Reportar Baja & Activar Smart Backup
                </LuminousButton>
              )}

              {/* Radar Pulsing Animation */}
              {isScanningRadar && (
                <div className={`p-4 rounded-card text-center flex flex-col items-center justify-center gap-1.5 ${
                  isDark ? 'bg-zinc-950' : 'bg-slate-100'
                }`}>
                  <div className="w-10 h-10 rounded-full border-2 border-sky-400 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-radar" />
                    <i className="ph-fill ph-radar text-base text-sky-400" />
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-400">
                    Buscando suplente talle {selectedWorker.shirtSize}...
                  </span>
                  <p className="text-[10px] text-zinc-400">Geolocalizando staff en guardia &lt; 3km</p>
                </div>
              )}

              {/* Scanned Candidate Found */}
              {scannedCandidate && (
                <div className={`p-3 rounded-card space-y-2.5 animate-fade-in ${
                  isDark ? 'bg-zinc-950 border border-sky-400/30' : 'bg-sky-50/80 border border-sky-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <StatusBadge variant="accent">Candidato Suplente IA</StatusBadge>
                    <span className="font-mono text-xs font-bold text-sky-400">{scannedCandidate.score}% Match</span>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    <img src={scannedCandidate.img} className="w-10 h-10 rounded-card object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{scannedCandidate.name}</h4>
                      <p className="font-mono text-[9px] text-zinc-400 truncate">{scannedCandidate.aiScanLog}</p>
                    </div>
                  </div>

                  <LuminousButton
                    icon="ph-arrows-left-right"
                    onClick={handleConfirmSmartBackup}
                  >
                    Confirmar reemplazo inmediato
                  </LuminousButton>
                </div>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};

// --- Tab 2: Fechas (Crear Nuevo Evento) ---
const AgencyTabFechas = () => {
  const { isDark, country, showToast } = useContext(AppContext);
  const [eventName, setEventName] = useState(country === "AR" ? "Festival Primavera 2026" : "Festival Sonar 2026");
  const [venue, setVenue] = useState(country === "AR" ? "Predio La Rural · CABA" : "Fira Montjuïc · Barcelona");
  const [pay, setPay] = useState(country === "AR" ? "$60.000 Neto" : "€140 Neto + SS");
  const [dresscode, setDresscode] = useState("Total black + calzado cómodo negro");

  useEffect(() => {
    setEventName(country === "AR" ? "Festival Primavera 2026" : "Festival Sonar 2026");
    setVenue(country === "AR" ? "Predio La Rural · CABA" : "Fira Montjuïc · Barcelona");
    setPay(country === "AR" ? "$60.000 Neto" : "€140 Neto + SS");
  }, [country]);

  const handleCreate = (e) => {
    e.preventDefault();
    showToast(`Evento "${eventName}" creado con geocerca de 150m activada.`, "success");
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Crear nuevo evento</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Configurá la geocerca para fichaje GPS y requisitos de staff ({country}).
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Nombre de la producción
          </label>
          <input 
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className={`w-full h-11 rounded-input px-3 text-xs font-semibold border outline-none ${
              isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Predio & Geocerca (150m)
          </label>
          <input 
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className={`w-full h-11 rounded-input px-3 text-xs font-semibold border outline-none ${
              isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Pago Neto ({country})
            </label>
            <input 
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className={`w-full h-11 rounded-input px-3 text-xs font-mono font-semibold border outline-none ${
                isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Horario Turno
            </label>
            <input 
              defaultValue="14:00 - 22:00 hs"
              className={`w-full h-11 rounded-input px-3 text-xs font-mono font-semibold border outline-none ${
                isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
              }`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Dresscode & Calzado Reglamentario
          </label>
          <input 
            value={dresscode}
            onChange={(e) => setDresscode(e.target.value)}
            className={`w-full h-11 rounded-input px-3 text-xs font-semibold border outline-none ${
              isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
            }`}
          />
        </div>

        <div className="pt-2">
          <LuminousButton
            icon="ph-plus-circle"
            onClick={handleCreate}
          >
            Publicar Convocatoria B2B
          </LuminousButton>
        </div>
      </form>
    </div>
  );
};

// --- Tab 3: Talento (Pool & Auditoría GPS Aislado Regionalmente) ---
const AgencyTabTalento = () => {
  const { isDark, showToast, country } = useContext(AppContext);
  const [filter, setFilter] = useState("Todos");

  const talentList = TALENT_POOL[country] || TALENT_POOL.AR;
  const gpsList = GPS_LOGS[country] || GPS_LOGS.AR;

  const filteredTalent = talentList.filter(t => {
    if (filter === "Todos") return true;
    return t.type === filter;
  });

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Base de talento ({country})</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Pool verificado de staff, historial y auditoría GPS de ingresos.
        </p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto hide-scroll pb-1">
        {["Todos", "Favoritos", "Guardia 24h", "Movilidad"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border shrink-0 transition-colors ${
              filter === f 
                ? 'bg-sky-400 text-zinc-950 border-sky-400 font-bold' 
                : isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Talent Cards */}
      <div className="space-y-2.5">
        {filteredTalent.map((t) => (
          <div key={t.id} className={`p-3 rounded-card flex items-center justify-between ${
            isDark ? 'bg-zinc-900 shadow-sm' : 'bg-white border border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={t.img} className="w-10 h-10 rounded-card object-cover shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">{t.name}</h4>
                <span className="text-[10px] text-zinc-400 font-mono block truncate">{t.stats}</span>
              </div>
            </div>
            <StatusBadge variant={t.badgeVariant}>{t.badge}</StatusBadge>
          </div>
        ))}
      </div>

      {/* Auditoría GPS en tiempo real Regional */}
      <div className="pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
          AUDITORÍA GPS (Ingresos en tiempo real · {country})
        </span>
        <div className={`p-3 rounded-card space-y-2 font-mono text-[11px] ${
          isDark ? 'bg-zinc-950' : 'bg-slate-100'
        }`}>
          {gpsList.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <span className={isDark ? 'text-zinc-300' : 'text-slate-800'}>
                {log.staff} · {log.gate}
              </span>
              <span className={`font-bold ${log.status === 'ok' ? 'text-[#34D399]' : 'text-[#F97316]'}`}>
                {log.time} ({log.distance})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Tab 4: Avisos (Notificaciones Operativas Regionalizadas) ---
const AgencyTabAvisos = () => {
  const { isDark, showToast, country } = useContext(AppContext);
  const avisosList = AVISOS_DATA[country] || AVISOS_DATA.AR;

  return (
    <div className="p-4 space-y-4 animate-fade-in overflow-y-auto hide-scroll pb-10">
      <div>
        <h2 className="text-base font-extrabold tracking-tight">Centro de avisos</h2>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
          Alertas operativas, bajas reportadas y compliance de seguros ({country}).
        </p>
      </div>

      <div className="space-y-3">
        {avisosList.map((item) => {
          const isDanger = item.type === "danger";
          const isWarning = item.type === "warning";
          
          return (
            <div key={item.id} className={`p-3.5 rounded-card space-y-1.5 transition-all ${
              isDanger 
                ? isDark ? 'bg-red-950/25 text-red-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                : isWarning
                  ? isDark ? 'bg-amber-950/25 text-amber-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  : isDark ? 'bg-zinc-900 text-zinc-200' : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
            }`}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <i className={`ph-fill ${item.icon} text-sm ${isDanger ? 'text-[#EF4444]' : isWarning ? 'text-[#F97316]' : 'text-sky-400'}`} />
                  {item.title}
                </span>
                <span className="font-mono text-[10px] text-zinc-400">{item.time}</span>
              </div>
              <p className={`text-[11px] leading-snug ${isDark ? 'text-zinc-300' : 'text-slate-600'}`}>
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
