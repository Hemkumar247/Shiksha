/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2B7A78',
        secondary: '#F4A261',
        background: '#FAFAFA',
        text: '#1C1C1C',
        accent: '#3D9970',
        error: '#E76F51',
        success: '#3D9970',
        warning: '#F4A261'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite'
      }
    },
  },
  plugins: [],
};