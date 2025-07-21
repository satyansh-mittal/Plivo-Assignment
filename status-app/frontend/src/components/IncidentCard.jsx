import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Clock } from "lucide-react"
import { format } from 'date-fns'
import axios from 'axios'

export function IncidentCard({ incident }) {
  const [showDialog, setShowDialog] = useState(false)
  const [newUpdate, setNewUpdate] = useState({ message: '', status: incident.status })
  const [loading, setLoading] = useState(false)

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await axios.post(`http://localhost:5000/api/incidents/${incident.id}/updates`, newUpdate)
      setNewUpdate({ message: '', status: incident.status })
      setShowDialog(false)
      // The real-time update will refresh the data
    } catch (error) {
      console.error('Error adding update:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'investigating': return 'bg-yellow-500'
      case 'identified': return 'bg-orange-500'
      case 'monitoring': return 'bg-blue-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'minor': return 'bg-yellow-500'
      case 'major': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{incident.title}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={`${getStatusColor(incident.status)} text-white`}>
                {incident.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={`${getImpactColor(incident.impact)} text-white`}>
                {incident.impact.toUpperCase()} IMPACT
              </Badge>
              <Badge variant="outline">
                {incident.incident_type.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <Clock className="h-4 w-4 inline mr-1" />
            {format(new Date(incident.created_at), 'MMM dd, HH:mm')}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {incident.description && (
          <p className="text-gray-600 mb-4">{incident.description}</p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {incident.updates.length} update{incident.updates.length !== 1 ? 's' : ''}
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Incident Update</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Recent Updates */}
                <div className="max-h-60 overflow-y-auto space-y-3">
                  <h4 className="font-medium">Recent Updates:</h4>
                  {incident.updates.slice(0, 3).map((update) => (
                    <div key={update.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-center mb-1">
                        <Badge className={`${getStatusColor(update.status)} text-white text-xs`}>
                          {update.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {format(new Date(update.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm">{update.message}</p>
                    </div>
                  ))}
                </div>
                
                {/* Add New Update Form */}
                <form onSubmit={handleAddUpdate} className="space-y-4">
                  <Select
                    value={newUpdate.status}
                    onValueChange={(value) => setNewUpdate(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="identified">Identified</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <textarea
                    className="w-full p-3 border rounded-md"
                    placeholder="Update message..."
                    rows={4}
                    value={newUpdate.message}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding Update...' : 'Add Update'}
                  </Button>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
