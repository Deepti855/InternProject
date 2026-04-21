/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        vibin: {
          bg: 'var(--bg-color)',
          text: 'var(--text-color)',
          body: 'var(--text-body)',
          card: 'var(--card-bg)',
          muted: 'var(--text-muted)',
          border: 'var(--border-color)',
          primary: '#2563EB', // Soft Blue
          primaryHover: '#1D4ED8',
          taupe: '#E2E8F0',
        },
        primary: {
          500: '#6F8B9B', // Mapped to existing generic references to prevent breaking other UI elements
          600: '#5A7584',
        },
        glass: {
            bg: 'rgba(255, 255, 255, 0.65)',
            border: 'rgba(255, 255, 255, 0.4)',
        }
      },
      backgroundImage: {
          'ambient-gradient': "radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.3), transparent 25%), radial-gradient(circle at 85% 30%, rgba(236, 72, 153, 0.3), transparent 25%)",
      }
    },
  },
  plugins: [],
};
