/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yardly: {
          primary: "#1769E0",
          primaryDark: "#0751C9",
          deepBlue: "#0038BC",
          oceanBlue: "#2D8CFF",
          lightBlue: "#D9EAFF",
          powderBlue: "#D0E6FD",
          bg: "#F7FAFF",
          text: "#10233F",
          muted: "#64748B",
          success: "#16A34A",
          warning: "#F59E0B",
          danger: "#DC2626",
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 56, 188, 0.08)',
        'glass-hover': '0 12px 40px 0 rgba(23, 105, 224, 0.16)',
        'floating': '0 20px 40px -15px rgba(0, 56, 188, 0.12)',
        'glow': '0 0 20px rgba(45, 140, 255, 0.4)',
      },
      backgroundImage: {
        'unitpay-hero': 'linear-gradient(135deg, #0038BC 0%, #1769E0 50%, #2D8CFF 100%)',
        'soft-gradient': 'linear-gradient(180deg, #F7FAFF 0%, #D9EAFF 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(247,250,255,0.95) 100%)',
      }
    },
  },
  plugins: [],
}
