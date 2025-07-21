import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "./StatusBadge"

export function ServiceCard({ service, onStatusChange }) {
  const handleStatusChange = (newStatus) => {
    onStatusChange(service.id, newStatus)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{service.name}</CardTitle>
        {service.description && (
          <p className="text-sm text-gray-600">{service.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <StatusBadge status={service.status} />
          <Select value={service.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="degraded">Degraded</SelectItem>
              <SelectItem value="partial_outage">Partial Outage</SelectItem>
              <SelectItem value="major_outage">Major Outage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
