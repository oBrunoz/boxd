/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // vermelho da marca Prisma (#E63946) no lugar dos tons de red usados no app
        red: {
          400: '#F07A83',
          500: '#EB5A65',
          600: '#E63946',
          700: '#C92A37',
        },
        // erro de campo e de toast: o trecho quente do espectro, sem brigar com o vermelho de ação
        coral: '#D85057',
      },
    },
  },
  plugins: [],
};
