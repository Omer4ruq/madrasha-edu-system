/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        // #DB9E30: "#DB9E30",
        // #DB9E30: "#DB9E30",
        // tertiary: "#DB9E30",
        // buttonHover: "#131a42",
        // textBlack: "#212529",
        // textGray: "#69796a",
        // blue: "#3F7AFC",
        // green: "#71dd37",
        // red: "#ff3e1d",
        // yellow: "#ffab00",
        // bgBlue: "#E1F1FF",
        // bgGreen: "#D2F2D4",
        // bgGray: "#00000010",
      },
      fontFamily: {
        roboto: ["Roboto", "Helvetica", "Arial", "sans-serif", "Cinzel Decorative"],
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        // Existing utilities
        // ".scrollbar-thin": {
        //   scrollbarWidth: "thin",
        //   scrollbarColor: "#ffffffcc transparent",
        // },
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#ffffff40",
            borderRadius: "20px",
          },
        },
        ".scrollbar-table": {
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#71dd37",
            borderRadius: "20px",
          },
        },
        // New utility to hide scrollbar
        ".no-scrollbar": {
          "-ms-overflow-style": "none" /* Internet Explorer and Edge */,
          "scrollbar-width": "none" /* Firefox */,
          "&::-webkit-scrollbar": {
            display: "none" /* Chrome, Safari, and Opera */,
          },
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};