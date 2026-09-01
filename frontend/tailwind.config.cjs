module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use `rgb(var(--...)/<alpha-value>)` so Tailwind's opacity modifiers work
        brand: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
        'brand-2': 'rgb(var(--brand-primary-2-rgb) / <alpha-value>)',
        'brand-primary': 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
        'brand-primary-2': 'rgb(var(--brand-primary-2-rgb) / <alpha-value>)',
        'brand-secondary': 'rgb(var(--brand-secondary-rgb) / <alpha-value>)',
        'brand-secondary-2': 'rgb(var(--brand-secondary-2-rgb) / <alpha-value>)',
        'brand-secondary-3': 'rgb(var(--brand-secondary-3-rgb) / <alpha-value>)'
      },
      backgroundImage: {
        'gradient-primary-linear': 'var(--gradient-primary-linear)',
        'gradient-primary-angled': 'var(--gradient-primary-angled)',
        'gradient-primary-radial': 'var(--gradient-primary-radial)'
      }
    }
  },
  plugins: [],
};
