/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
      },
      colors: {
        'gradient-start': '#0DAED6',
        'gradient-end': '#7841F1',
      },
      gradients: {
        'purple-pink': ['gradient-start', 'gradient-end'], // 그라디언트 커스텀 키
      }
    },
    fontFamily: {
      'PretendardVariable': ['PretendardVariable'],
      'seoleim': ['seolleimcool-bold']
    }
  },
  plugins: [
    require('flowbite/plugin'), require("tailwind-scrollbar-hide"),
    require('@tailwindcss/forms'),
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.custom-gradient-hover': {
          '&:hover': {
            border: '1px solid transparent',
            backgroundImage: theme('backgroundImage.gradient-to-r'),
            color: 'white',
            '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, rgba(255, 255, 255, 0))`,
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    }    
  ],
}