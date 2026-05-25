import Icon from '@/components/ui/Icon'

type Grade = 'S' | 'A' | 'B' | 'C'

interface BadgeProps {
  grade: Grade
  score?: number | string
}

const GRADE_STYLE: Record<Grade, { bg: string; iconClass: string; gradeClass: string; scoreClass: string }> = {
  S: {
    bg: 'bg-primary',
    iconClass: 'text-white',
    gradeClass: 'text-neutral-900',
    scoreClass: 'text-[#404040]',
  },
  A: {
    bg: 'bg-neutral-900',
    iconClass: 'text-primary',
    gradeClass: 'text-neutral-50',
    scoreClass: 'text-neutral-50',
  },
  B: {
    bg: 'bg-neutral-400',
    iconClass: 'text-white',
    gradeClass: 'text-white',
    scoreClass: 'text-white',
  },
  C: {
    bg: 'bg-neutral-50',
    iconClass: 'text-neutral-500',
    gradeClass: 'text-neutral-500',
    scoreClass: 'text-neutral-500',
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
