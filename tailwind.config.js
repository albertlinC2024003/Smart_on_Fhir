/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#c4dab3',
          200: '#b2d497',
          300: '#DEEEDE'
        },
        mui: {
          100: '#DADDE3'
        },
        emr: {
          100: '#0B61F7',
          200: '#071C43',
          300: '#F3F4F8',
          400: '#52607A',
          500: '#B5BBC7',
          red: {
            100: '#D02A1E'
          }
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif']
      },
      boxShadow: {
        'emr-table': '0 0 4px 0 rgba(0, 0, 0, 0.25)'
      }
    }
  },
  plugins: [],
}

