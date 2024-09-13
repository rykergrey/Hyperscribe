import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'gradient-animation': 'gradient 10s ease infinite',
  		},
  		keyframes: {
  			gradient: {
  				'0%, 100%': { 'background-position': '0% 0%' },
  				'50%': { 'background-position': '100% 100%' },
  			},
  		},
  	},
  	backgroundImage: {
  		'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
  	},
  	animation: {
  		'gradient-shift': 'gradient-shift 20s ease-in-out infinite',
  	},
  	keyframes: {
  		'gradient-shift': {
  			'0%, 100%': { 'background-position': '0% 50%' },
  			'50%': { 'background-position': '100% 50%' },
  			'gradient-shift-fast': {
  				'0%, 100%': { '--gradient-color': '#4C1D95' }, /* Purple */
  				'25%': { '--gradient-color': '#1E3A8A' }, /* Dark Blue */
  				'50%': { '--gradient-color': '#F97316' }, /* Orange */
  				'75%': { '--gradient-color': '#000000' }, /* Black */
  			},
  		},
  	},
  	animation: {
  		'color-shift': 'color-shift 10s ease-in-out infinite',
  	},
  	keyframes: {
  		'color-shift': {
  			'0%, 100%': { '--gradient-color': '#4C1D95' },
  			'20%': { '--gradient-color': '#7C3AED' },
  			'40%': { '--gradient-color': '#C026D3' },
  			'60%': { '--gradient-color': '#DB2777' },
  			'80%': { '--gradient-color': '#E11D48' },
  			'90%': { '--gradient-color': '#F97316' },
  		},
  	},
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
