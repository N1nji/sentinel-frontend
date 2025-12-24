/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // 🔹 ISSO AQUI É OBRIGATÓRIO PARA O CONTEXTO FUNCIONAR
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}