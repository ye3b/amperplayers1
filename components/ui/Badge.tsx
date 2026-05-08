import Icon from '@/components/ui/Icon'

type Grade = 'S' | 'A' | 'B' | 'C'

interface BadgeProps {
  grade: Grade
  score?: number | string
}

const GRADE_STYLE: Record<Grade, { bg: string; iconClass: string; gradeClass: string; scoreClass: string }> = {
  S: {
    bg: 'bg-[#00F5A0]',
    iconClass: 'text-white',
    gradeClass: 'text-[#181818]',
    scoreClass: 'text-[#404040]',
  },
  A: {
    bg: 'bg-[#181818]',
    iconClass: 'text-[#00F5A0]',
    gradeClass: 'text-[#F8F8F8]',
    scoreClass: 'text-[#F8F8F8]',
  },
  B: {
    bg: 'bg-[#9E9E9E]',
    iconClass: 'text-white',
    gradeClass: 'text-white',
    scoreClass: 'text-white',
  },
  C: {
    bg: 'bg-[#F8F8F8]',
    iconClass: 'text-[#757575]',
    gradeClass: 'text-[#757575]',
    scoreClass: 'text-[#757575]',
  },
}

const GRADE_ICON: Record<Grade, 'stars' | 'star-02'> = {
  S: 'stars',
  A: 'stars',
  B: 'star-02',
  C: 'star-02',
}

export default function Badge({ grade, score }: BadgeProps) {
  const { bg, iconClass, gradeClass, scoreClass } = GRADE_STYLE[grade]
  const icon = GRADE_ICON[grade]

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded h-6 ${bg}`}>
      <Icon name={icon} size={16} className={iconClass} />
      <span className={`text-[10px] leading-[14px] font-bold uppercase ${gradeClass}`}>
        {grade}
      </span>
      {score !== undefined && (
        <span className={`text-[10px] leading-[14px] font-normal ${scoreClass}`}>
          {score}
        </span>
      )}
    </div>
  )
}
