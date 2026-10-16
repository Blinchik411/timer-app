import { format, parseISO, isValid } from 'date-fns'

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''

  const parsed = parseISO(dateStr)
  if (!isValid(parsed)) return ''

  return format(parsed, 'dd.MM.yyyy')
}

