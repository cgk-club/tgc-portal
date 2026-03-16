import { ItineraryItem } from '@/types'

const TIME_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  morning: 'Morning',
  lunch: 'Lunch',
  afternoon: 'Afternoon',
  evening: 'Evening',
  dinner: 'Dinner',
  late_night: 'Late Night',
}

interface ClientNoteCardProps {
  item: ItineraryItem
}

export default function ClientNoteCard({ item }: ClientNoteCardProps) {
  const timeParts: string[] = []
  if (item.exact_time) timeParts.push(item.exact_time)
  if (item.time_of_day) timeParts.push(TIME_LABELS[item.time_of_day] || item.time_of_day)
  const timeLabel = timeParts.join(' \u00B7 ')

  return (
    <div className="bg-pearl rounded-[8px] border-l-4 border-gold p-4">
      {timeLabel && (
        <span className="text-xs text-gold font-medium mb-1 block">{timeLabel}</span>
      )}
      {item.custom_title && (
        <p className="text-sm font-medium text-gray-700 italic font-body">{item.custom_title}</p>
      )}
      {item.custom_note && (
        <p className="text-sm text-gray-500 italic font-body mt-1">{item.custom_note}</p>
      )}
    </div>
  )
}
