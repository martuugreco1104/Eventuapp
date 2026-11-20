# AGENTS.md — EventuApp Design & Architecture Directives

## 1. Identidad & Stack Técnico
- **Producto:** EventuApp (Plataforma Mobile-First B2B2C para staffing y gestión operativa de eventos en Argentina 🇦🇷 y España 🇪🇸).
- **Stack:** HTML5 semántico, Tailwind CSS (configurado con `darkMode: 'class'`), React 18, Phosphor Icons (`@phosphor-icons/web`).
- **Tipografía:** `Plus Jakarta Sans` para interfaz y títulos; `JetBrains Mono` para datos técnicos (DNI/NIE, talles, medidas, distancias, horarios, tarifas y Match Score).

## 2. Sistema de Diseño & Tokens (Luminous Blue + Dual Theme)
- **Dark Mode (Default / Backstage):**
  - Canvas: `#09090B` (`zinc-950`)
  - Surface / Cards / Drawers: `#18181B` (`zinc-900`)
  - Subtle / Celdas internas: `#27272A` (`zinc-800`)
  - Borders: `#27272A` (`zinc-800`)
  - Text Primary: `#F4F4F5` (`zinc-100`) | Secondary: `#A1A1AA` (`zinc-400`)
  - Accent Primary (Luminous Blue): `#38BDF8` (`sky-400`) | Hover: `#7DD3FC` (`sky-300`) | Text on Accent: `#09090B`
  - Glow: `shadow-[0_8px_20px_-4px_rgba(56,189,248,0.35)]`
- **Light Mode (Exteriores / Luz Solar Directa):**
  - Canvas: `#F8FAFC` (`slate-50`)
  - Surface: `#FFFFFF`
  - Subtle: `#F1F5F9` (`slate-100`)
  - Borders: `#E2E8F0` (`slate-200`)
  - Text Primary: `#0F172A` (`slate-900`) | Secondary: `#475569` (`slate-600`)
  - Accent Primary (Luminous Blue): `#0284C7` (`sky-600`) | Hover: `#0369A1` (`sky-700`) | Text on Accent: `#FFFFFF`
- **Estados Semánticos:**
  - Success: `#34D399` (Dark) / `#059669` (Light)
  - Warning (Falta AP/PRL o Pendiente): `#F97316` (Dark) / `#EA580C` (Light)
  - Danger (Baja reportada): `#EF4444` (Dark) / `#DC2626` (Light)
  - Info (Movilidad propia / Guardia 24h): `#818CF8` (Dark) / `#4F46E5` (Light)

## 3. Separación Estricta de Países
- **Argentina (🇦🇷 AR):**
  - Moneda: ARS ($)
  - Documentación: DNI, Monotributo (Constancia AFIP/ARCA), Póliza AP (Accidentes Personales) / ART con cláusula de no repetición.
  - Locaciones: Hipódromo de San Isidro, Predio La Rural Palermo, Costa Salguero, Movistar Arena.
- **España (🇪🇸 ES):**
  - Moneda: EUR (€)
  - Documentación: DNI / NIE, Alta Seguridad Social (Régimen General), Certificado de Aptitud PRL (Prevención de Riesgos Laborales).
  - Locaciones: Fira Barcelona Gran Via, IFEMA Madrid, Palau Sant Jordi, WiZink Center.

## 4. Reglas de Ergonomía & UX (Leyes de UX)
- **Fitts Law:** CTAs críticos de ancho completo en thumb-zone, altura mínima `48px`–`56px` (`h-12` a `h-14`).
- **Hick Law:** Cero formularios interminables; flujos progresivos (Steppers, Bottom Sheets, Chips).
- **Cero Alertas Nativas:** Nunca usar `alert()`, `confirm()` ni `prompt()`. Todo feedback se procesa vía `FeedbackToast`.
- **Shell Externo:** La barra superior de pruebas (País AR/ES, Rol Productora/Staff, Dark/Light Mode, Viewport) debe existir fuera del marco simulado del teléfono para no tapar los headers.
