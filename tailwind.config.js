/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#C0392B',
        gold: '#C8860A',
        'gold-light': '#E4A820',
        'gold-pale': '#F5D78E',
        dark: '#1A0E00',
        dark2: '#2C1A00',
        maroon: '#6B1A1A',
        cream: '#FDF6E3',
        cream2: '#FFF8ED',
      },
      fontFamily: {
        sans: ['DM Sans', 'Poppins', 'sans-serif'],
        display: ['Playfair Display', 'Cinzel', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 16px 48px rgba(200,134,10,0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
