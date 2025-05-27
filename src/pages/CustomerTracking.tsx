
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Package, Search, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Map from '@/components/Map';

interface Order {
  id: string;
  customerName: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  deliveryPartner: string;
  deliveryPartnerPhone: string;
  estimatedTime: string;
  currentLocation?: { lat: number; lng: number };
  deliveryAddress: string;
  items: string[];
  totalAmount: number;
}

const CustomerTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Set up global callback for location updates
    window.locationUpdateCallback = (location: { lat: number; lng: number }) => {
      if (order) {
        setOrder(prev => prev ? { ...prev, currentLocation: location } : null);
      }
    };

    return () => {
      delete window.locationUpdateCallback;
    };
  }, [order]);

  const trackOrder = () => {
    if (!trackingId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tracking ID',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Sample order data
      const sampleOrder: Order = {
        id: trackingId,
        customerName: user?.name || 'John Doe',
        status: 'in_transit',
        deliveryPartner: 'Sarah Chen',
        deliveryPartnerPhone: '+1-555-1002',
        estimatedTime: '15-20 minutes',
        currentLocation: {
          lat: 37.7849, // Slightly offset from default location
          lng: -122.4094
        },
        deliveryAddress: '123 Main St, Downtown',
        items: ['Pizza Margherita', 'Garlic Bread', 'Coke'],
        totalAmount: 25.99
      };

      setOrder(sampleOrder);
      setIsLoading(false);
      
      toast({
        title: 'Order Found',
        description: `Tracking order ${trackingId}`
      });
    }, 1000);
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

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'assigned': return 'Delivery partner assigned';
      case 'picked_up': return 'Order picked up from restaurant';
      case 'in_transit': return 'On the way to you';
      case 'delivered': return 'Order delivered';
      default: return 'Processing order';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
                <p className="text-gray-600">Real-time delivery tracking</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
              localStorage.removeItem('user');
              window.location.href = '/';
            }}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tracking Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Tracking ID</CardTitle>
            <CardDescription>
              Enter your order ID to track your delivery in real-time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Enter order ID (e.g., ORD002, ORD005)"
                className="flex-1"
              />
              <Button onClick={trackOrder} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Tracking...' : 'Track Order'}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Try tracking ID: ORD002 or ORD005
            </p>
          </CardContent>
        </Card>

        {order && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order #{order.id}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="capitalize">{order.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <CardDescription>{getStatusMessage(order.status)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                      <div className="flex items-start space-x-1">
                        <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                        <p className="text-sm">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <p className="text-sm font-medium">{order.estimatedTime}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items Ordered</p>
                      <div className="flex items-start space-x-1">
                        <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-sm">{order.items.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount</span>
                        <span className="font-bold text-lg">${order.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Delivery Partner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{order.deliveryPartner}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{order.deliveryPartnerPhone}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                  
                  {order.currentLocation && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-green-800">
                          Live tracking active
                        </p>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        Location updates every 3 seconds
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Live Tracking</span>
                </CardTitle>
                <CardDescription>
                  {order.currentLocation 
                    ? 'Follow your delivery partner in real-time' 
                    : 'Waiting for location updates...'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 relative">
                  {order.currentLocation ? (
                    <Map 
                      deliveryLocation={order.currentLocation}
                      deliveryPartnerName={order.deliveryPartner}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Waiting for delivery partner location...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!order && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start Tracking Your Order
              </h3>
              <p className="text-gray-600">
                Enter your order ID above to see real-time delivery updates and track your delivery partner on the map.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerTracking;
