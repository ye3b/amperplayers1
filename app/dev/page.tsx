import Icon from '@/components/ui/Icon'
import SportIcon, { SportKey } from '@/components/ui/SportIcon'

const ICON_NAMES = [
  'arrow-left', 'bag-04', 'bell', 'box', 'camera-01', 'check-01',
  'circle-plus', 'clock-forward', 'dash', 'eye', 'filter', 'grid-01',
  'heart', 'heart-filled', 'home-04', 'menu-01', 'message-circle', 'plus-01',
  'right', 'search-01', 'settings', 'share', 'shield-check', 'sort-vertical-02',
  'star-02', 'stars', 'trending', 'user-profile-03', 'x-01',
] as const

const SPORT_KEYS: SportKey[] = [
  'all', 'soccer', 'futsal', 'basketball', 'baseball', 'tennis',
  'badminton', 'volleyball', 'golf', 'swimming', 'cycling', 'running',
  'fitness', 'climbing', 'skiing', 'snowboard', 'surfing', 'tabletennis', 'boxing',
]

export default function DevPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-[22px] font-bold text-[#181818] mb-6">Design System</h1>

      {/* UI Icons */}
      <h2 className="text-[15px] font-bold text-[#181818] mb-3">UI Icons <span className="text-[#9E9E9E] font-normal text-[13px]">Icon.tsx · {ICON_NAMES.length}종</span></h2>
      <div className="grid grid-cols-4 gap-3 mb-10">
        {ICON_NAMES.map((name) => (
          <div key={name} className="flex flex-col items-center gap-2 p-3 bg-[#F8F8F8] rounded-xl">
            <Icon name={name as Parameters<typeof Icon>[0]['name']} size={24} className="text-[#181818]" />
            <span className="text-[10px] text-[#9E9E9E] text-center leading-tight break-all">{name}</span>
          </div>
        ))}
      </div>

      {/* Sport Icons — default */}
      <h2 className="text-[15px] font-bold text-[#181818] mb-3">Sport Icons <span className="text-[#9E9E9E] font-normal text-[13px]">SportIcon.tsx · {SPORT_KEYS.length}종</span></h2>
      <div className="grid grid-cols-4 gap-3 mb-10">
        {SPORT_KEYS.map((key) => (
          <div key={key} className="flex flex-col items-center gap-2 p-3 bg-[#F8F8F8] rounded-xl">
            <SportIcon sport={key} size={26} className="text-[#181818]" />
            <span className="text-[10px] text-[#9E9E9E] text-center leading-tight">{key}</span>
          </div>
        ))}
      </div>

      {/* Sport Icons — selected state */}
      <h2 className="text-[15px] font-bold text-[#181818] mb-3">Sport Icons <span className="text-[#9E9E9E] font-normal text-[13px]">선택 상태</span></h2>
      <div className="grid grid-cols-4 gap-3 mb-10">
        {SPORT_KEYS.map((key) => (
          <div key={key} className="flex flex-col items-center gap-2 p-3 bg-[#181818] rounded-xl">
            <SportIcon sport={key} size={26} className="text-white" />
            <span className="text-[10px] text-white/50 text-center leading-tight">{key}</span>
          </div>
        ))}
      </div>

      {/* Colors */}
      <h2 className="text-[15px] font-bold text-[#181818] mb-3">Colors</h2>
      <div className="flex flex-col gap-2 mb-10">
        {[
          { hex: '#181818', label: '텍스트 Primary' },
          { hex: '#383838', label: '텍스트 Secondary' },
          { hex: '#757575', label: '텍스트 Tertiary' },
          { hex: '#9E9E9E', label: '텍스트 Disabled' },
          { hex: '#C8C8C8', label: '구분선 Light' },
          { hex: '#E8E8E8', label: '구분선 Default' },
          { hex: '#EFEFEF', label: '구분선 Strong' },
          { hex: '#F5F5F5', label: '배경 Card' },
          { hex: '#F8F8F8', label: '배경 Page' },
          { hex: '#00F5A0', label: 'Accent Green' },
          { hex: '#FF4444', label: 'Error Red' },
        ].map(({ hex, label }) => (
          <div key={hex} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-[#EFEFEF] flex-shrink-0" style={{ backgroundColor: hex }} />
            <div>
              <p className="text-[13px] font-medium text-[#181818]">{label}</p>
              <p className="text-[11px] text-[#9E9E9E]">{hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
