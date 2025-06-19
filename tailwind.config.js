/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#FBF9F5',
          100: '#F7F3E8',
          200: '#F0E9D8',
          300: '#E8DFC7',
          400: '#D6C9A6',
        },
        ink: {
          800: '#2D2A24',
          900: '#1A1814',
        },
        red: {
          600: '#BC002D',
          700: '#9A0025',
        },
        indigo: {
          700: '#1B1F45',
          800: '#171A3A',
        },
        tea: {
          50: '#F1F5F2',
          100: '#E8F0EA',
          200: '#D9E4DD',
        }
      },
      fontFamily: {
        brush: ['Brush', 'sans-serif'],
        sans: ['Noto Sans JP', 'Inter', 'sans-serif']
      },
      backgroundImage: {
        'paper-texture': "url('https://images.pexels.com/photos/7486026/pexels-photo-7486026.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
};