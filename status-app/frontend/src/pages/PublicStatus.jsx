import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { socketService } from '../services/socketService'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { StatusBadge } from '../components/StatusBadge'
import { Badge } from '../components/ui/badge'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export function PublicStatus() {
  const { orgSlug } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatusData()
    setupRealtime()
    
    return () => {
      socketService.removeAllListeners()
      socketService.disconnect()
    }
  }, [orgSlug])

  const setupRealtime = () => {
    socketService.connect()
    socketService.joinPublic(orgSlug)
    
    socketService.on('public_status_update', (service) => {
      setData(prev => ({
        ...prev,
        services: prev.services.map(s => s.id === service.id ? service : s)
      }))
    })
    
    socketService.on('public_incident_update', (incident) => {
      setData(prev => ({
        ...prev,
        active_incidents: prev.active_incidents.map(i => i.id === incident.id ? incident : i),
        recent_incidents: [incident, ...prev.recent_incidents.filter(i => i.id !== incident.id)].slice(0, 10)
      }))
    })
  }

  const fetchStatusData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/public/${orgSlug}/status`)
      setData(response.data)
    } catch (error) {
      console.error('Error fetching status data:', error)
      setError('Failed to load status page')
    } finally {
      setLoading(false)
    }
  }

  const getOverallStatus = () => {
    if (!data || data.services.length === 0) return 'operational'
    
    const hasDown = data.services.some(s => s.status === 'major_outage')
    const hasPartial = data.services.some(s => s.status === 'partial_outage')
    const hasDegraded = data.services.some(s => s.status === 'degraded')
    
    if (hasDown) return 'major_outage'
    if (hasPartial) return 'partial_outage'
    if (hasDegraded) return 'degraded'
    return 'operational'
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'operational': return 'All systems are operational'
      case 'degraded': return 'Some systems are experiencing degraded performance'
      case 'partial_outage': return 'Some systems are experiencing an outage'
      case 'major_outage': return 'Major systems are down'
      default: return 'Status unknown'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-6 w-6 text-green-500" />
      default: return <AlertTriangle className="h-6 w-6 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading status page...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    )
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">{data.organization.name}</h1>
            <p className="text-gray-600 mt-2">Service Status</p>
            
            <div className="mt-6 flex items-center justify-center space-x-3">
              {getStatusIcon(overallStatus)}
              <span className="text-xl font-medium text-gray-900">
                {getStatusMessage(overallStatus)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Incidents */}
        {data.active_incidents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Active Incidents
            </h2>
            <div className="space-y-4">
              {data.active_incidents.map((incident) => (
                <Card key={incident.id} className="border-orange-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{incident.title}</CardTitle>
                      <Badge className="bg-orange-500 text-white">
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{incident.description}</p>
                    {incident.updates.length > 0 && (
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="text-sm font-medium">Latest Update:</p>
                        <p className="text-sm text-gray-600">{incident.updates[0].message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(incident.updates[0].created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Services Status */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Services</h2>
          <div className="space-y-3">
            {data.services.map((service) => (
              <Card key={service.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600">{service.description}</p>
                      )}
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        {data.recent_incidents.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent History</h2>
            <div className="space-y-4">
              {data.recent_incidents.slice(0, 5).map((incident) => (
                <Card key={incident.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{incident.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge 
                            className={
                              incident.status === 'resolved' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-orange-500 text-white'
                            }
                          >
                            {incident.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {incident.incident_type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {format(new Date(incident.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </CardHeader>
                  {incident.description && (
                    <CardContent>
                      <p className="text-gray-600">{incident.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            Powered by Status Page • Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </p>
        </div>
      </footer>
    </div>
  )
}
