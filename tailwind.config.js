/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  corePlugins: {
    // Keep current UI intact by disabling global reset
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};

