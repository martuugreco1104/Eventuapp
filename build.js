const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

function build() {
  console.log('--- Starting EventuApp Build ---');

  const files = [
    'src/data.js',
    'src/components.jsx',
    'src/agency_views.jsx',
    'src/worker_views.jsx',
    'src/app.jsx'
  ];

  let combinedSource = '';
  for (const file of files) {
    if (!fs.existsSync(file)) {
      throw new Error(`File not found: ${file}`);
    }
    console.log(`Reading ${file}...`);
    combinedSource += `\n// --- Source: ${file} ---\n` + fs.readFileSync(file, 'utf8') + '\n';
  }

  console.log('Transpiling with Babel (preset-react)...');
  const transformed = babel.transformSync(combinedSource, {
    presets: [
      ['@babel/preset-react', { runtime: 'classic' }]
    ]
  }).code;

  console.log(`Babel transformation complete. Compiled JS length: ${transformed.length} chars`);

  const htmlTemplate = `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>EventuApp - Staffing & Operaciones de Eventos</title>
    
    <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Phosphor Icons Web -->
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        zinc: {
                            800: '#27272A',
                            900: '#18181B',
                            950: '#09090B',
                        },
                        slate: {
                            50: '#F8FAFC',
                            100: '#F1F5F9',
                            200: '#E2E8F0',
                            600: '#475569',
                            800: '#1E293B',
                            900: '#0F172A',
                        },
                        sky: {
                            300: '#7DD3FC',
                            400: '#38BDF8',
                            500: '#0EA5E9',
                            600: '#0284C7',
                            700: '#0369A1',
                        },
                    },
                    fontFamily: {
                        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace'],
                    },
                    borderRadius: {
                        'input': '12px',
                        'card': '16px',
                        'hero': '20px',
                        'sheet': '24px',
                    },
                    boxShadow: {
                        'glow-sky': '0 8px 20px -4px rgba(56, 189, 248, 0.35)',
                        'glow-sky-subtle': '0 4px 14px -2px rgba(56, 189, 248, 0.25)',
                    },
                    animation: {
                        'slide-up': 'slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                        'toast': 'toastAnim 300ms cubic-bezier(0.16, 1, 0.3, 1)',
                        'radar': 'radarPulse 1.2s infinite ease-out',
                    },
                    keyframes: {
                        slideUp: {
                            '0%': { transform: 'translateY(100%)' },
                            '100%': { transform: 'translateY(0)' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        toastAnim: {
                            '0%': { transform: 'translateY(-20px)', opacity: '0' },
                            '100%': { transform: 'translateY(0)', opacity: '1' },
                        },
                        radarPulse: {
                            '0%': { transform: 'scale(0.8)', opacity: '0.9' },
                            '100%': { transform: 'scale(2.2)', opacity: '0' },
                        }
                    }
                }
            }
        }
    </script>

    <style>
        body { 
            font-family: 'Plus Jakarta Sans', sans-serif;
            -webkit-tap-highlight-color: transparent;
            overflow-x: hidden;
        }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .drag-handle {
            width: 36px;
            height: 4px;
            border-radius: 2px;
            margin: 8px auto 10px auto;
        }
    </style>
</head>
<body class="bg-[#09090B] text-zinc-100 min-h-screen overflow-x-hidden antialiased">
    <div id="root"></div>

    <!-- React & ReactDOM 18 -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

    <!-- Pre-compiled Native JavaScript -->
    <script>
${transformed}
    </script>
</body>
</html>`;

  fs.writeFileSync('index.html', htmlTemplate, 'utf8');
  console.log('✅ index.html generated successfully with 0 errors!');
}

build();
