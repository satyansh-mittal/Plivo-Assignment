import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket']
      })

      this.socket.on('connect', () => {
        console.log('Connected to server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server')
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinOrganization(organizationId) {
    if (this.socket) {
      this.socket.emit('join_organization', { organization_id: organizationId })
    }
  }

  joinPublic(orgSlug) {
    if (this.socket) {
      this.socket.emit('join_public', { org_slug: orgSlug })
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback)
      
      // Store the listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, [])
      }
      this.listeners.get(event).push(callback)
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
      
      // Remove from stored listeners
      const eventListeners = this.listeners.get(event)
      if (eventListeners) {
        const index = eventListeners.indexOf(callback)
        if (index > -1) {
          eventListeners.splice(index, 1)
        }
      }
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback)
        })
      })
      this.listeners.clear()
    }
  }
}

export const socketService = new SocketService()
