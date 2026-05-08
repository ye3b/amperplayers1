import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러 (Figma Swatch: #00F5A0)
        primary: '#00F5A0',
        dark: '#181818',
        gray: {
          DEFAULT: '#757575',
          light: '#9E9E9E',
          subtle: '#F8F8F8',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      // Figma Type Styles 기반 타이포그래피
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
        '4': '4px',
        '24': '24px',
        '80': '80px',
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
