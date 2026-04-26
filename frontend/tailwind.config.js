/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          500: "#ea580c",
          600: "#c2410c",
          900: "#7c2d12"
        }
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(124, 45, 18, 0.35)"
      }
    },
  },
  plugins: [],
};
