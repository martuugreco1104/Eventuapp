const { useState, useEffect, useRef, createContext, useContext } = React;

const AppContext = createContext(null);

// --- StatusBadge con tokens dual-theme y semánticos estrictos ---
const StatusBadge = ({ variant = "accent", children }) => {
  const { isDark } = useContext(AppContext);
  const baseClasses = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-tight border transition-colors shrink-0";
  
  const variants = {
    accent: isDark 
      ? "bg-sky-400/15 text-sky-400 border-sky-400/30" 
      : "bg-sky-50 text-sky-700 border-sky-600/30",
    success: isDark 
      ? "bg-[#34D399]/15 text-[#34D399] border-[#34D399]/30" 
      : "bg-emerald-50 text-[#059669] border-[#059669]/30",
    warning: isDark 
      ? "bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30" 
      : "bg-amber-50 text-[#EA580C] border-[#EA580C]/30",
    danger: isDark 
      ? "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30" 
      : "bg-rose-50 text-[#DC2626] border-[#DC2626]/30",
    info: isDark 
      ? "bg-[#818CF8]/15 text-[#818CF8] border-[#818CF8]/30" 
      : "bg-indigo-50 text-[#4F46E5] border-[#4F46E5]/30",
    neutral: isDark 
      ? "bg-zinc-800 text-zinc-300 border-zinc-700/60" 
      : "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <span className={`${baseClasses} ${variants[variant] || variants.accent}`}>
      {children}
    </span>
  );
};

// --- LuminousButton (Fitts Law: h-12 mínima, touch target amplio) ---
const LuminousButton = ({ 
  children, 
  onClick, 
  icon, 
  variant = "accent", 
  disabled = false, 
  loading = false, 
  full = true,
  className = ""
}) => {
  const { isDark } = useContext(AppContext);
  const heightClass = "h-12 min-h-[48px]";
  
  const variants = {
    accent: isDark
      ? "bg-sky-400 text-[#09090B] hover:bg-sky-300 active:bg-sky-400 font-bold shadow-glow-sky border-none"
      : "bg-sky-600 text-[#FFFFFF] hover:bg-sky-700 active:bg-sky-600 font-bold shadow-glow-sky-subtle border-none",
    danger: isDark
      ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/35 hover:bg-[#EF4444]/25"
      : "bg-rose-50 text-[#DC2626] border border-rose-200 hover:bg-rose-100",
    secondary: isDark
      ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
      : "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200",
    outline: isDark
      ? "bg-transparent text-zinc-300 border border-zinc-700 hover:border-zinc-500"
      : "bg-transparent text-slate-700 border border-slate-300 hover:border-slate-400"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${full ? 'w-full' : 'px-4'} 
        ${heightClass} 
        rounded-input 
        text-xs 
        font-bold 
        flex 
        items-center 
        justify-center 
        gap-2 
        transition-all 
        duration-150 
        active:scale-[0.98] 
        cursor-pointer 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${variants[variant] || variants.accent}
        ${className}
      `}
    >
      {loading ? (
        <i className="ph ph-spinner-gap animate-spin text-base" />
      ) : icon ? (
        <i className={`ph-bold ${icon} text-base`} />
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
};

// --- BottomSheet (Strictly ABSOLUTE dentro del contenedor mobile de 393px) ---
const BottomSheet = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  const { isDark } = useContext(AppContext);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden">
      {/* Backdrop con blur interno */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className={`
        relative w-full rounded-t-sheet border-t shadow-2xl animate-slide-up flex flex-col max-h-[88%] z-10 transition-colors
        ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-200 text-slate-900'}
      `}>
        {/* Drag handle */}
        <div className={`drag-handle ${isDark ? 'bg-zinc-700' : 'bg-slate-300'}`} />
        
        {/* Header */}
        <div className={`px-4 pb-2.5 flex justify-between items-center border-b shrink-0 ${isDark ? 'border-zinc-800/80' : 'border-slate-100'}`}>
          <h3 className="font-bold text-sm tracking-tight truncate pr-2">{title}</h3>
          <button 
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0 ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
            aria-label="Cerrar modal"
          >
            <i className="ph ph-x text-base" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto hide-scroll p-4 pb-8 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- FeedbackToast (Cero alert() nativos, absolute al contenedor) ---
const FeedbackToast = ({ message, type = "info", onClose }) => {
  if (!message) return null;
  const { isDark } = useContext(AppContext);

  const colors = {
    success: isDark ? "bg-zinc-900 border-[#34D399]/40 text-[#34D399]" : "bg-white border-[#059669]/40 text-[#059669]",
    warning: isDark ? "bg-zinc-900 border-[#F97316]/40 text-[#F97316]" : "bg-white border-[#EA580C]/40 text-[#EA580C]",
    danger: isDark ? "bg-zinc-900 border-[#EF4444]/40 text-[#EF4444]" : "bg-white border-[#DC2626]/40 text-[#DC2626]",
    info: isDark ? "bg-zinc-900 border-sky-400/40 text-sky-400" : "bg-white border-sky-600/40 text-sky-600"
  };

  const icons = {
    success: "ph-fill ph-check-circle",
    warning: "ph-fill ph-warning",
    danger: "ph-fill ph-warning-octagon",
    info: "ph-fill ph-info"
  };

  return (
    <div className="absolute top-3 left-3 right-3 z-50 animate-toast">
      <div className={`p-3 rounded-card border shadow-xl flex items-center gap-2.5 backdrop-blur-md ${colors[type] || colors.info}`}>
        <i className={`${icons[type] || icons.info} text-lg shrink-0`} />
        <span className={`flex-1 min-w-0 text-[11px] leading-snug whitespace-normal ${isDark ? 'text-zinc-100 font-medium' : 'text-slate-900 font-medium'}`}>
          {message}
        </span>
        <button 
          onClick={onClose} 
          className="text-zinc-400 hover:text-zinc-200 text-xs shrink-0 cursor-pointer p-1"
        >
          <i className="ph ph-x" />
        </button>
      </div>
    </div>
  );
};

// --- LoginScreen (Selector de Rol Limpio & Acceso Directo) ---
const LoginScreen = ({ role, setRole, onLoginSuccess, onStartOnboarding }) => {
  const { isDark, country } = useContext(AppContext);
  const [phone, setPhone] = useState("+54 9 11 4092-8812");

  return (
    <div className="flex flex-col h-full p-4 justify-between animate-fade-in overflow-y-auto hide-scroll">
      <div className="space-y-4 pt-2">
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-card bg-sky-400 flex items-center justify-center text-[#09090B] font-black text-base shadow-glow-sky">
            E
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight">EventuApp</h1>
            <p className="text-[10px] font-mono text-sky-400">Staffing & Operaciones B2B2C</p>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className={`p-1 rounded-card border grid grid-cols-2 gap-1 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setRole('worker')}
            className={`h-10 rounded-input text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'worker' 
                ? 'bg-sky-400 text-zinc-950 font-black shadow-sm' 
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="ph-bold ph-user" />
            <span>Soy Staff</span>
          </button>
          <button
            onClick={() => setRole('agency')}
            className={`h-10 rounded-input text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              role === 'agency' 
                ? 'bg-sky-400 text-zinc-950 font-black shadow-sm' 
                : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="ph-bold ph-buildings" />
            <span>Productora / B2B</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="space-y-1">
          <h2 className="text-sm font-extrabold tracking-tight">
            {role === 'worker' ? 'Acceso Staff & Promotores' : 'Panel de Agencias & Productoras'}
          </h2>
          <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            {role === 'worker' 
              ? 'Ingresá para fichar con GPS, ver propuestas confirmadas y acceder a tu book verificado.' 
              : 'Gestión de cupos en vivo, ingresos en puerta y reemplazos inmediatos ante bajas.'}
          </p>
        </div>

        {/* Credentials Form */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Teléfono Celular ({country})
            </label>
            <div className={`flex items-center border rounded-input px-3 h-12 transition-colors ${
              isDark ? 'bg-zinc-900 border-zinc-800 focus-within:border-sky-400' : 'bg-white border-slate-200 focus-within:border-sky-600 shadow-sm'
            }`}>
              <i className="ph ph-phone text-zinc-400 text-sm mr-2" />
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent font-mono text-xs font-semibold outline-none text-zinc-100"
              />
            </div>
          </div>

          <LuminousButton 
            icon="ph-arrow-right"
            onClick={() => onLoginSuccess(role)}
          >
            {role === 'worker' ? 'Entrar a mi Jornada' : 'Entrar al Backstage Operativo'}
          </LuminousButton>
        </div>

        {/* Onboarding trigger for staff */}
        {role === 'worker' && (
          <div className="pt-2 text-center">
            <button 
              onClick={onStartOnboarding}
              className={`w-full h-12 rounded-input border text-xs font-bold transition-all active:scale-[0.98] ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <i className="ph ph-sparkle text-sky-400 mr-1.5" />
              ¿Primera vez? Crear perfil verificado (3 pasos)
            </button>
          </div>
        )}
      </div>

      {/* Footer Security Badges */}
      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <i className="ph-fill ph-shield-check text-[#34D399]" /> Compliance {country}
        </span>
        <span>EventuApp v1.0</span>
      </div>
    </div>
  );
};

// --- StaffOnboarding (3 Pasos: Datos -> Medidas/Fotos -> Disponibilidad) ---
const StaffOnboarding = ({ onComplete, onCancel }) => {
  const { isDark, country, showToast } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState("1.74 m");
  const [shirt, setShirt] = useState("M");
  const [pant, setPant] = useState("40");
  const [shoes, setShoes] = useState("38");
  const [guard24, setGuard24] = useState(true);
  const [car, setCar] = useState(true);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      showToast("¡Perfil guardado y activado con éxito!", "success");
      onComplete();
    }
  };

  return (
    <div className="flex flex-col h-full p-4 justify-between overflow-y-auto hide-scroll animate-fade-in pb-10">
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
          >
            <i className="ph ph-arrow-left" /> {step === 1 ? 'Volver al Login' : 'Paso anterior'}
          </button>
          <span className="font-mono text-xs font-bold text-sky-400">
            Paso {step} de 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-1.5 rounded-full overflow-hidden mb-4 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`}>
          <div 
            className="h-full bg-sky-400 rounded-full transition-all duration-300 shadow-glow-sky-subtle" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step 1: Legal Compliance */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Validación Legal ({country})</h2>
              <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {country === 'AR' 
                  ? 'Ingresá tu DNI y estado tributario ante ARCA/AFIP para emitir facturación y activar póliza AP.' 
                  : 'Ingresá tu DNI/NIE y alta en Seguridad Social para contratación directa.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {country === 'AR' ? 'DNI / CUIL' : 'DNI / NIE'}
                </label>
                <input 
                  type="text" 
                  defaultValue={country === 'AR' ? '41.205.892' : 'Y-4921028-H'} 
                  className={`w-full h-11 rounded-input px-3 text-xs font-mono font-semibold border outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {country === 'AR' ? 'CBU / Alias Bancario' : 'IBAN Bancario (SEPA)'}
                </label>
                <input 
                  type="text" 
                  defaultValue={country === 'AR' ? 'martina.staff.mp' : 'ES91 2100 0418 4502 0005 1192'} 
                  className={`w-full h-11 rounded-input px-3 text-xs font-mono font-semibold border outline-none ${
                    isDark ? 'bg-zinc-900 border-zinc-800 focus:border-sky-400 text-zinc-100' : 'bg-white border-slate-200 focus:border-sky-600 text-slate-900 shadow-sm'
                  }`}
                />
              </div>

              <div className={`p-3 rounded-card border flex items-center justify-between ${
                isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <i className="ph-fill ph-file-text text-sky-400 text-base" />
                  <span className="text-xs font-semibold">
                    {country === 'AR' ? 'Constancia Monotributo' : 'Certificado PRL Vigente'}
                  </span>
                </div>
                <StatusBadge variant="success">Vigente</StatusBadge>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Wardrobe & Photos */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Armá tu perfil operativo</h2>
              <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Subí tus fotos reglamentarias y seleccioná tus talles para reserva directa de vestuario.
              </p>
            </div>

            {/* 3 Photos */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Fotos Verificadas (3)</span>
                <span className="text-[9px] font-mono text-[#34D399] flex items-center gap-1">
                  <i className="ph-fill ph-check-circle" /> 3/3 Cargadas
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative rounded-card overflow-hidden border border-zinc-700/60 aspect-[3/4] group">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[9px] font-bold text-white">Rostro</span>
                  </div>
                </div>
                <div className="relative rounded-card overflow-hidden border border-zinc-700/60 aspect-[3/4] group">
                  <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[9px] font-bold text-white">Cuerpo</span>
                  </div>
                </div>
                <div className="relative rounded-card overflow-hidden border border-zinc-700/60 aspect-[3/4] group">
                  <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                    <span className="text-[9px] font-bold text-white">Calzado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes Grid */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Talles y Calzado</span>
              <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] text-zinc-400 block">ALT</span>
                  <input value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-transparent font-bold text-xs text-center outline-none" />
                </div>
                <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] text-zinc-400 block">REM</span>
                  <input value={shirt} onChange={e => setShirt(e.target.value)} className="w-full bg-transparent font-bold text-xs text-center text-sky-400 outline-none" />
                </div>
                <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] text-zinc-400 block">PAN</span>
                  <input value={pant} onChange={e => setPant(e.target.value)} className="w-full bg-transparent font-bold text-xs text-center outline-none" />
                </div>
                <div className={`p-2 rounded-card border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
                  <span className="text-[9px] text-zinc-400 block">CAL</span>
                  <input value={shoes} onChange={e => setShoes(e.target.value)} className="w-full bg-transparent font-bold text-xs text-center outline-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Availability & Reemplazos */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-base font-extrabold tracking-tight">Disponibilidad para reemplazos</h2>
              <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                Configurá tu disponibilidad para reemplazos de último minuto y movilidad.
              </p>
            </div>

            <div className="space-y-2.5">
              <div 
                onClick={() => setGuard24(!guard24)}
                className={`p-3 rounded-card border flex items-center justify-between cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">Disponible para reemplazos</h4>
                  <p className="text-[10px] text-zinc-400">Recibí avisos de emergencia con plus de tarifa</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${guard24 ? 'bg-sky-400' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${guard24 ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              <div 
                onClick={() => setCar(!car)}
                className={`p-3 rounded-card border flex items-center justify-between cursor-pointer ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold">Movilidad Propia (Auto / Moto)</h4>
                  <p className="text-[10px] text-zinc-400">Prioridad en eventos de predios alejados</p>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${car ? 'bg-sky-400' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${car ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="pt-4 border-t border-zinc-800/80">
        <LuminousButton
          icon={step === 3 ? "ph-check" : "ph-arrow-right"}
          onClick={handleNextStep}
        >
          {step === 3 ? "Activar Perfil y Entrar" : "Continuar"}
        </LuminousButton>
      </div>
    </div>
  );
};
