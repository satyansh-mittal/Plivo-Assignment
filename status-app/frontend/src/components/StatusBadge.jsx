import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }) {
  const getVariantAndText = (status) => {
    switch (status) {
      case 'operational':
        return { variant: 'success', text: 'Operational' }
      case 'degraded':
        return { variant: 'secondary', text: 'Degraded Performance' }
      case 'partial_outage':
        return { variant: 'destructive', text: 'Partial Outage' }
      case 'major_outage':
        return { variant: 'error', text: 'Major Outage' }
      default:
        return { variant: 'outline', text: 'Unknown' }
    }
  }

  const { variant, text } = getVariantAndText(status)
  
  return (
    <Badge variant={variant}>
      {text}
    </Badge>
  )
}
