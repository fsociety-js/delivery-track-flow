
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, Clock, Navigation, Phone, CheckCircle, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  totalAmount: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  pickupAddress: string;
  deliveryAddress: string;
  vendorName: string;
}

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Generate sample assigned orders
    const sampleOrders: Order[] = [
      {
        id: 'ORD002',
        customerName: 'Jane Smith',
        customerPhone: '+1-555-0124',
        items: ['Burger Combo', 'Fries', 'Milkshake'],
        totalAmount: 18.50,
        status: 'assigned',
        pickupAddress: 'Pizza Palace, 789 Food Court',
        deliveryAddress: '456 Oak Ave, Midtown',
        vendorName: 'Pizza Palace'
      },
      {
        id: 'ORD005',
        customerName: 'David Wilson',
        customerPhone: '+1-555-0126',
        items: ['Thai Green Curry', 'Jasmine Rice', 'Spring Rolls'],
        totalAmount: 24.75,
        status: 'picked_up',
        pickupAddress: 'Thai Garden, 321 Asia Street',
        deliveryAddress: '987 Elm Street, Downtown',
        vendorName: 'Thai Garden'
      }
    ];

    setOrders(sampleOrders);

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set a default location (San Francisco)
          setCurrentLocation({
            lat: 37.7749,
            lng: -122.4194
          });
        }
      );
    }

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, []);

  const startTracking = () => {
    setIsTracking(true);
    
    // Simulate location updates every 3 seconds
    const interval = setInterval(() => {
      if (currentLocation) {
        // Simulate small movements (like a delivery person moving)
        const newLocation = {
          lat: currentLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: currentLocation.lng + (Math.random() - 0.5) * 0.001
        };
        setCurrentLocation(newLocation);
        
        // In a real app, you would send this to the server
        console.log('Location update:', newLocation);
        
        // Simulate WebSocket update
        if (window.locationUpdateCallback) {
          window.locationUpdateCallback(newLocation);
        }
      }
    }, 3000);
    
    setTrackingInterval(interval);
    
    toast({
      title: 'Tracking Started',
      description: 'Your location is now being tracked and shared with customers'
    });
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    
    toast({
      title: 'Tracking Stopped',
      description: 'Location tracking has been disabled'
    });
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    
    const statusMessages = {
      picked_up: 'Order picked up from vendor',
      in_transit: 'En route to customer',
      delivered: 'Order delivered successfully'
    };
    
    toast({
      title: 'Status Updated',
      description: statusMessages[newStatus] || 'Order status updated'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAction = (status: Order['status']) => {
    switch (status) {
      case 'assigned': return { action: 'picked_up', label: 'Mark as Picked Up' };
      case 'picked_up': return { action: 'in_transit', label: 'Start Delivery' };
      case 'in_transit': return { action: 'delivered', label: 'Mark as Delivered' };
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Navigation className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery Dashboard</h1>
                <p className="text-gray-600">Welcome, {user?.name || 'Delivery Partner'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isTracking ? (
                <Button variant="outline" onClick={stopTracking} className="text-red-600 border-red-600">
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Tracking
                </Button>
              ) : (
                <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Start Tracking
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                localStorage.removeItem('user');
                window.location.href = '/';
              }}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isTracking ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Navigation className={`h-6 w-6 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Tracking Status</h3>
                  <p className="text-gray-600">
                    {isTracking ? 'Location tracking is active' : 'Location tracking is disabled'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Current Location</p>
                <p className="font-mono text-sm">
                  {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Loading...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned Orders</CardTitle>
            <CardDescription>Your current delivery assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {orders.map((order) => {
                const nextAction = getNextAction(order.status);
                
                return (
                  <div key={order.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.totalAmount}</p>
                        <p className="text-sm text-gray-600">{order.vendorName}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Customer Details</p>
                        <p className="font-medium">{order.customerName}</p>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Items</p>
                        <p className="text-sm">{order.items.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Pickup Location</p>
                        <div className="flex items-start space-x-1">
                          <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                          <p className="text-sm">{order.pickupAddress}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Delivery Location</p>
                        <div className="flex items-start space-x-1">
                          <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {nextAction && (
                        <Button 
                          onClick={() => updateOrderStatus(order.id, nextAction.action)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {nextAction.label}
                        </Button>
                      )}
                      
                      {order.status === 'delivered' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders assigned yet</p>
                  <p className="text-sm text-gray-500">Check back later for new delivery assignments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
