import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1F1F1F',
          900: '#181818',
          950: '#0A0A0A',
          1000: '#000000',
        },
        primary: {
          DEFAULT: '#00F5A0',
          hover: '#00D98E',
          pressed: '#00BD7B',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['80px', { lineHeight: '88px', letterSpacing: '-2px', fontWeight: '700' }],
        'display-2': ['48px', { lineHeight: '56px', letterSpacing: '-1px', fontWeight: '700' }],
        'heading-1': ['32px', { lineHeight: '40px', letterSpacing: '-0.5px', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '32px', letterSpacing: '-0.25px', fontWeight: '700' }],
        'heading-3': ['18px', { lineHeight: '26px', letterSpacing: '-0.25px', fontWeight: '700' }],
        'body-1': ['16px', { lineHeight: '24px', letterSpacing: '0px', fontWeight: '700' }],
        'body-2': ['14px', { lineHeight: '20px', letterSpacing: '0px', fontWeight: '500' }],
        'button': ['14px', { lineHeight: '16px', letterSpacing: '1.5px', fontWeight: '700' }],
        'label-1': ['14px', { lineHeight: '16px', letterSpacing: '1px', fontWeight: '700' }],
        'label-2': ['12px', { lineHeight: '16px', letterSpacing: '1px', fontWeight: '700' }],
        'cta-sm': ['12px', { lineHeight: '16px', letterSpacing: '1px', fontWeight: '700' }],
        'caption': ['10px', { lineHeight: '14px', letterSpacing: '0.25px', fontWeight: '700' }],
        'breadcrumb': ['10px', { lineHeight: '14px', letterSpacing: '0.25px', fontWeight: '400' }],
        'nav-label': ['10px', { lineHeight: '14px', letterSpacing: '0.25px', fontWeight: '400' }],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
        full: '9999px',
      },
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
        32: '128px',
      },
    },
  },
  plugins: [
    function ({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.scrollbar-hide::-webkit-scrollbar': {
          display: 'none',
        },
      })
    },
  ],
}

export default config
