
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'ws://localhost:3001'; // Backend WebSocket URL

  connect(userId: string, userType: 'vendor' | 'delivery' | 'customer') {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        auth: {
          userId,
          userType
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to server:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Delivery partner location updates
  sendLocationUpdate(orderId: string, location: { lat: number; lng: number }) {
    if (this.socket) {
      this.socket.emit('location-update', {
        orderId,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Listen for location updates (customer side)
  onLocationUpdate(callback: (data: { orderId: string; location: { lat: number; lng: number }; timestamp: string }) => void) {
    if (this.socket) {
      this.socket.on('location-update', callback);
    }
  }

  // Join tracking session
  joinTrackingSession(orderId: string) {
    if (this.socket) {
      this.socket.emit('join-tracking', orderId);
    }
  }

  // Leave tracking session
  leaveTrackingSession(orderId: string) {
    if (this.socket) {
      this.socket.emit('leave-tracking', orderId);
    }
  }

  // Order status updates
  onOrderStatusUpdate(callback: (data: { orderId: string; status: string; timestamp: string }) => void) {
    if (this.socket) {
      this.socket.on('order-status-update', callback);
    }
  }

  sendOrderStatusUpdate(orderId: string, status: string) {
    if (this.socket) {
      this.socket.emit('order-status-update', {
        orderId,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const socketService = new SocketService();
