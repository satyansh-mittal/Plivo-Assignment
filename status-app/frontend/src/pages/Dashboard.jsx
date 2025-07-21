import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { socketService } from '../services/socketService'
import axios from 'axios'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { ServiceCard } from '../components/ServiceCard'
import { IncidentCard } from '../components/IncidentCard'
import { Badge } from '../components/ui/badge'
import { Plus, Settings, LogOut } from 'lucide-react'

export function Dashboard() {
  const { user, organization, logout } = useAuth()
  const [services, setServices] = useState([])
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [newService, setNewService] = useState({ name: '', description: '' })
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    service_id: '',
    impact: 'minor',
    incident_type: 'incident'
  })
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showIncidentDialog, setShowIncidentDialog] = useState(false)
  const [createServiceLoading, setCreateServiceLoading] = useState(false)
  const [createIncidentLoading, setCreateIncidentLoading] = useState(false)

  useEffect(() => {
    fetchData()
    setupRealtime()
    
    return () => {
      socketService.removeAllListeners()
      socketService.disconnect()
    }
  }, [])

  const setupRealtime = () => {
    socketService.connect()
    socketService.joinOrganization(organization.id)
    
    socketService.on('service_created', (service) => {
      setServices(prev => [...prev, service])
    })
    
    socketService.on('service_updated', (service) => {
      setServices(prev => prev.map(s => s.id === service.id ? service : s))
    })
    
    socketService.on('incident_created', (incident) => {
      setIncidents(prev => [incident, ...prev])
    })
    
    socketService.on('incident_updated', (incident) => {
      setIncidents(prev => prev.map(i => i.id === incident.id ? incident : i))
    })
  }

  const fetchData = async () => {
    try {
      const [servicesRes, incidentsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/services'),
        axios.get('http://localhost:5000/api/incidents')
      ])
      
      setServices(servicesRes.data)
      setIncidents(incidentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateService = async (e) => {
    e.preventDefault()
    
    if (createServiceLoading) return // Prevent double submission
    
    setCreateServiceLoading(true)
    try {
      await axios.post('http://localhost:5000/api/services', newService)
      // Don't update local state - let WebSocket handle it
      setNewService({ name: '', description: '' })
      setShowServiceDialog(false)
    } catch (error) {
      console.error('Error creating service:', error)
    } finally {
      setCreateServiceLoading(false)
    }
  }

  const handleCreateIncident = async (e) => {
    e.preventDefault()
    
    if (createIncidentLoading) return // Prevent double submission
    
    setCreateIncidentLoading(true)
    try {
      await axios.post('http://localhost:5000/api/incidents', newIncident)
      // Don't update local state - let WebSocket handle it
      setNewIncident({
        title: '',
        description: '',
        service_id: '',
        impact: 'minor',
        incident_type: 'incident'
      })
      setShowIncidentDialog(false)
    } catch (error) {
      console.error('Error creating incident:', error)
    } finally {
      setCreateIncidentLoading(false)
    }
  }

  const handleStatusChange = async (serviceId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/services/${serviceId}`, {
        status: newStatus
      })
      setServices(prev => prev.map(s => s.id === serviceId ? response.data : s))
    } catch (error) {
      console.error('Error updating service status:', error)
    }
  }

  const getOverallStatus = () => {
    if (services.length === 0) return 'operational'
    
    const hasDown = services.some(s => s.status === 'major_outage')
    const hasPartial = services.some(s => s.status === 'partial_outage')
    const hasDegraded = services.some(s => s.status === 'degraded')
    
    if (hasDown) return 'major_outage'
    if (hasPartial) return 'partial_outage'
    if (hasDegraded) return 'degraded'
    return 'operational'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'partial_outage': return 'bg-orange-500'
      case 'major_outage': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'operational': return 'All Systems Operational'
      case 'degraded': return 'Degraded Performance'
      case 'partial_outage': return 'Partial System Outage'
      case 'major_outage': return 'Major System Outage'
      default: return 'Unknown Status'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const overallStatus = getOverallStatus()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600">Status Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getStatusColor(overallStatus)} text-white`}>
                {getStatusText(overallStatus)}
              </Badge>
              <Button
                variant="outline"
                onClick={() => window.open(`/public/${organization.slug}`, '_blank')}
              >
                View Public Page
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Services</h2>
            <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateService} className="space-y-4">
                  <Input
                    placeholder="Service Name"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newService.description}
                    onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button type="submit" className="w-full" disabled={createServiceLoading}>
                    {createServiceLoading ? 'Creating...' : 'Create Service'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {services.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No services added yet. Create your first service!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Incidents Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Incidents & Maintenance</h2>
            <Dialog open={showIncidentDialog} onOpenChange={setShowIncidentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Incident</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateIncident} className="space-y-4">
                  <Input
                    placeholder="Incident Title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  
                  <Select
                    value={newIncident.service_id}
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, service_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id.toString()}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newIncident.impact}
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, impact: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Impact Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="major">Major</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={newIncident.incident_type}
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, incident_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>

                  <textarea
                    className="w-full p-2 border rounded-md"
                    placeholder="Description"
                    rows={3}
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                  />
                  
                  <Button type="submit" className="w-full" disabled={createIncidentLoading}>
                    {createIncidentLoading ? 'Creating...' : 'Create Incident'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>

          {incidents.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No incidents reported. That's great!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
