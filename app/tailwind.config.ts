import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark mode palette
        dark: {
          bg: '#0A0A0A',
          surface: '#121212',
          overlay: '#1A1A2E',
          accent: '#8B5CF6',
          accentHover: '#A78BFA',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          textPrimary: '#FFFFFF',
          textSecondary: '#F3F4F6',
          textMuted: '#9CA3AF',
        },
      },
      backgroundColor: {
        'dark-bg': '#0A0A0A',
        'dark-surface': '#121212',
        'dark-overlay': 'rgba(26, 26, 46, 0.5)',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        glass: '20px',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        'ease-studio': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

export default config;
