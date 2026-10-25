/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ['"MS Sans Serif"', 'Tahoma', 'Verdana', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace', 'sans-serif']
      },
      boxShadow: {
        'win95-outset': 'inset -1px -1px 0px #000, inset 1px 1px 0px #fff, inset -2px -2px 0px #808080, inset 2px 2px 0px #dfdfdf',
        'win95-inset': 'inset 1px 1px 0px #000, inset -1px -1px 0px #fff, inset 2px 2px 0px #808080, inset -2px -2px 0px #dfdfdf',
        'win95-active': 'inset 2px 2px 0px #000, inset -1px -1px 0px #fff',
        'retro-card': '4px 4px 0px 0px #000',
        'retro-card-hover': '6px 6px 0px 0px #000',
      },
      colors: {
        win: {
          gray: '#c0c0c0',
          darkgray: '#808080',
          lightgray: '#dfdfdf',
          blue: '#000080',
          cyan: '#008080',
          navy: '#000050',
          yellow: '#ffff00',
        }
      }
    },
  },
  plugins: [],
}
