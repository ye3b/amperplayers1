export type SportKey =
  | 'all'
  | 'soccer'
  | 'futsal'
  | 'basketball'
  | 'baseball'
  | 'tennis'
  | 'badminton'
  | 'volleyball'
  | 'golf'
  | 'swimming'
  | 'cycling'
  | 'running'
  | 'fitness'
  | 'climbing'
  | 'skiing'
  | 'snowboard'
  | 'surfing'
  | 'tabletennis'
  | 'boxing'

const ICONS: Record<SportKey, string> = {
  all: `
    <circle cx="6.5" cy="6.5" r="2" fill="currentColor"/>
    <circle cx="12" cy="6.5" r="2" fill="currentColor"/>
    <circle cx="17.5" cy="6.5" r="2" fill="currentColor"/>
    <circle cx="6.5" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <circle cx="17.5" cy="12" r="2" fill="currentColor"/>
    <circle cx="6.5" cy="17.5" r="2" fill="currentColor"/>
    <circle cx="12" cy="17.5" r="2" fill="currentColor"/>
    <circle cx="17.5" cy="17.5" r="2" fill="currentColor"/>
  `,

  soccer: `
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M12 7.8L14.6 9.7L13.7 12.8H10.3L9.4 9.7Z" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linejoin="round"/>
    <path d="M12 7.8L12 4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M14.6 9.7L17.5 8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M9.4 9.7L6.5 8.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M13.7 12.8L15.3 15.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M10.3 12.8L8.7 15.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
  `,

  futsal: `
    <rect x="3" y="6.5" width="18" height="11" rx="1.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M3 9.5H6.5V14.5H3" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 9.5H17.5V14.5H21" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="1.5" stroke="currentColor" stroke-width="1.3" fill="none"/>
  `,

  basketball: `
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M12 3C15.5 5.5 17 8.5 17 12C17 15.5 15.5 18.5 12 21" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M12 3C8.5 5.5 7 8.5 7 12C7 15.5 8.5 18.5 12 21" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `,

  baseball: `
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M9 4C7 6.5 6 9.2 6 12C6 14.8 7 17.5 9 20" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M15 4C17 6.5 18 9.2 18 12C18 14.8 17 17.5 15 20" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M9 8L11.5 9M9 11L11.5 12M9 14L11.5 15" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
    <path d="M15 8L12.5 9M15 11L12.5 12M15 14L12.5 15" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
  `,

  tennis: `
    <ellipse cx="10.5" cy="10.5" rx="6.8" ry="6.8" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M5.3 6.5C7 7.8 7.8 9.1 7.8 10.5C7.8 11.9 7 13.2 5.3 14.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M15.7 6.5C14 7.8 13.2 9.1 13.2 10.5C13.2 11.9 14 13.2 15.7 14.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  `,

  badminton: `
    <circle cx="12" cy="4.5" r="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="12" y1="7" x2="12" y2="15.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M12 9.5L7 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 9.5L17 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M12 11.5L7.5 9.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M12 11.5L16.5 9.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M9 19.5L12 15.5L15 19.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    <line x1="8" y1="19.5" x2="16" y2="19.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,

  volleyball: `
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <path d="M4 9C6.5 9.8 9 10 12 10C15 10 17.5 9.8 20 9" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M5.5 17C7 15 9 13 12 12.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M18.5 17C17 15 15 13 12 12.5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  `,

  golf: `
    <path d="M8 21H20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="12" y1="21" x2="12" y2="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 6L19 9.5L12 13" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="7" cy="20.5" r="1.3" fill="currentColor"/>
  `,

  swimming: `
    <circle cx="15.5" cy="5" r="1.8" fill="currentColor"/>
    <path d="M15.5 6.8L13 10L8 11.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M3 14.5C4.5 14.5 5.5 16 7.5 16C9.5 16 10.5 14.5 12 14.5C13.5 14.5 14.5 16 16.5 16C18.5 16 19.5 14.5 21 14.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M3 18.5C4.5 18.5 5.5 20 7.5 20C9.5 20 10.5 18.5 12 18.5C13.5 18.5 14.5 20 16.5 20C18.5 20 19.5 18.5 21 18.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  `,

  cycling: `
    <circle cx="6" cy="16" r="4.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <circle cx="18" cy="16" r="4.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <circle cx="15" cy="7.5" r="1.8" fill="currentColor"/>
    <path d="M6 16L11 9H15L18 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 16L11 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="11" y1="9" x2="15" y2="9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,

  running: `
    <circle cx="15.5" cy="4.5" r="2" fill="currentColor"/>
    <path d="M15.5 6.5L13.5 10L10 12L7.5 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.5 10L16 13L13 16.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15.5 6.5L18.5 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M10 12L7.5 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,

  fitness: `
    <rect x="7" y="9.5" width="10" height="5" rx="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <rect x="3" y="7" width="4" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <rect x="17" y="7" width="4" height="10" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <line x1="1.5" y1="10.5" x2="3" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="1.5" y1="13.5" x2="3" y2="13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="21" y1="10.5" x2="22.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="21" y1="13.5" x2="22.5" y2="13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,

  climbing: `
    <circle cx="16" cy="4.5" r="2" fill="currentColor"/>
    <path d="M16 6.5L14 10L10 12L8 17" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 10L16.5 14" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="7.5" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="14.5" r="1.5" fill="currentColor"/>
    <circle cx="9" cy="19" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
  `,

  skiing: `
    <circle cx="17.5" cy="4.5" r="2" fill="currentColor"/>
    <path d="M17.5 6.5L15 10L11 12L6.5 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 10L17 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 19.5L20 20.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M17 13.5L20 20" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M6.5 16L4 19.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  `,

  snowboard: `
    <circle cx="16.5" cy="4.5" r="2" fill="currentColor"/>
    <path d="M16.5 6.5L14 9L7 13" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 9L16.5 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M4 19L20 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M16.5 13L19 14.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M7 13L5 18.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  `,

  surfing: `
    <circle cx="17" cy="4.5" r="2" fill="currentColor"/>
    <path d="M17 6.5L15 9L10 12L8 15" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 9L17.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M3 18C5 16.5 7 16.5 9 17C11 17.5 13 17 15 16" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M3 21C6 19 9 19.5 12 20C15 20.5 18 19.5 21 18" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  `,

  tabletennis: `
    <circle cx="11" cy="11" r="7.5" stroke="currentColor" stroke-width="1.6" fill="none"/>
    <line x1="16.3" y1="16.3" x2="22" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <path d="M7 8C8.5 8.5 9.5 9.5 9.5 11C9.5 12.5 8.5 13.5 7 14" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="5" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
  `,

  boxing: `
    <path d="M7.5 10.5V8C7.5 6.3 8.8 5 10.5 5H14C15.3 5 16.5 5.8 17 7L18.5 10.5C19 11.8 18.5 13 17 13.5L15 14.5V16H9V14.5L7.5 13.5C6.5 13 6 11.5 6.5 10.5Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    <line x1="7.5" y1="10.5" x2="11" y2="10.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="7.5" y1="18" x2="16.5" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="9" y1="18" x2="9" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="15" y1="18" x2="15" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  `,
}

interface Props {
  sport: SportKey
  size?: number
  className?: string
}

export default function SportIcon({ sport, size = 24, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICONS[sport] }}
    />
  )
}
