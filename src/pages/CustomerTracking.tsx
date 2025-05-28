import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Clock, Phone, Package, Search, Navigation, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeliveryMap from '@/components/DeliveryMap';
import { socketService } from '@/services/socketService';

interface Order {
  id: string;
  customerName: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  deliveryPartner: string;
  deliveryPartnerPhone: string;
  estimatedTime: string;
  currentLocation?: { lat: number; lng: number };
  pickupLocation: { lat: number; lng: number; address: string };
  deliveryAddress: string;
  deliveryLocation: { lat: number; lng: number };
  items: string[];
  totalAmount: number;
  createdAt: string;
}

const CustomerTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadCustomerOrders(parsedUser.id);
    }
  }, []);

  const loadCustomerOrders = (customerId: string) => {
    // Simulate loading customer orders
    const sampleOrders: Order[] = [
      {
        id: 'ORD001',
        customerName: 'John Doe',
        status: 'delivered',
        deliveryPartner: 'Mike Wilson',
        deliveryPartnerPhone: '+1-555-1001',
        estimatedTime: 'Delivered',
        pickupLocation: {
          lat: 37.7849,
          lng: -122.4194,
          address: 'Pizza Palace, 456 Restaurant Row'
        },
        deliveryLocation: {
          lat: 37.7749,
          lng: -122.4194
        },
        deliveryAddress: '123 Main St, Downtown',
        items: ['Burger Combo', 'Fries', 'Coke'],
        totalAmount: 18.99,
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 'ORD002',
        customerName: 'John Doe',
        status: 'in_transit',
        deliveryPartner: 'Sarah Chen',
        deliveryPartnerPhone: '+1-555-1002',
        estimatedTime: '15-20 minutes',
        currentLocation: {
          lat: 37.7849,
          lng: -122.4094
        },
        pickupLocation: {
          lat: 37.7849,
          lng: -122.4194,
          address: 'Pizza Palace, 456 Restaurant Row'
        },
        deliveryLocation: {
          lat: 37.7749,
          lng: -122.4194
        },
        deliveryAddress: '123 Main St, Downtown',
        items: ['Pizza Margherita', 'Garlic Bread', 'Coke'],
        totalAmount: 25.99,
        createdAt: '2024-01-15T14:45:00Z'
      },
      {
        id: 'ORD003',
        customerName: 'John Doe',
        status: 'picked_up',
        deliveryPartner: 'Alex Johnson',
        deliveryPartnerPhone: '+1-555-1003',
        estimatedTime: '25-30 minutes',
        pickupLocation: {
          lat: 37.7849,
          lng: -122.4194,
          address: 'Sushi Express, 789 Food Court'
        },
        deliveryLocation: {
          lat: 37.7749,
          lng: -122.4194
        },
        deliveryAddress: '123 Main St, Downtown',
        items: ['Sushi Roll Set', 'Miso Soup', 'Green Tea'],
        totalAmount: 32.50,
        createdAt: '2024-01-15T16:20:00Z'
      }
    ];
    setCustomerOrders(sampleOrders);
  };

  useEffect(() => {
    if (selectedOrder && user) {
      // Connect to socket service for real-time updates
      socketService.connect(user.id, 'customer');
      
      // Join tracking session for this order
      socketService.joinTrackingSession(selectedOrder.id);
      
      // Listen for location updates
      socketService.onLocationUpdate((data) => {
        if (data.orderId === selectedOrder.id) {
          setSelectedOrder(prev => prev ? { 
            ...prev, 
            currentLocation: data.location 
          } : null);
        }
      });

      // Listen for order status updates
      socketService.onOrderStatusUpdate((data) => {
        if (data.orderId === selectedOrder.id) {
          setSelectedOrder(prev => prev ? { 
            ...prev, 
            status: data.status as Order['status']
          } : null);
          
          toast({
            title: 'Order Status Updated',
            description: `Your order is now ${data.status.replace('_', ' ')}`
          });
        }
      });

      return () => {
        socketService.leaveTrackingSession(selectedOrder.id);
        socketService.disconnect();
      };
    }
  }, [selectedOrder, user, toast]);

  const trackOrderById = () => {
    if (!trackingId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tracking ID',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    // Check if order exists in customer's orders first
    const existingOrder = customerOrders.find(order => order.id === trackingId);
    
    if (existingOrder) {
      setSelectedOrder(existingOrder);
      setIsLoading(false);
      toast({
        title: 'Order Found',
        description: `Tracking your order ${trackingId}`
      });
      return;
    }

    // Simulate API call for external tracking
    setTimeout(() => {
      const sampleOrder: Order = {
        id: trackingId,
        customerName: user?.name || 'Customer',
        status: 'in_transit',
        deliveryPartner: 'Sarah Chen',
        deliveryPartnerPhone: '+1-555-1002',
        estimatedTime: '15-20 minutes',
        currentLocation: {
          lat: 37.7849,
          lng: -122.4094
        },
        pickupLocation: {
          lat: 37.7849,
          lng: -122.4194,
          address: 'Pizza Palace, 456 Restaurant Row'
        },
        deliveryLocation: {
          lat: 37.7749,
          lng: -122.4194
        },
        deliveryAddress: '123 Main St, Downtown',
        items: ['Pizza Margherita', 'Garlic Bread', 'Coke'],
        totalAmount: 25.99,
        createdAt: new Date().toISOString()
      };

      setSelectedOrder(sampleOrder);
      setIsLoading(false);
      
      toast({
        title: 'Order Found',
        description: `Tracking order ${trackingId}`
      });
    }, 1000);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
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

  const handleRouteCalculated = (distance: number, duration: number) => {
    setRouteInfo({ distance, duration });
    setSelectedOrder(prev => prev ? {
      ...prev,
      estimatedTime: `${duration} minutes`
    } : null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <p className="text-gray-600">Track your deliveries in real-time</p>
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
        <Tabs defaultValue="my-orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-orders">My Orders</TabsTrigger>
            <TabsTrigger value="track-by-id">Track by ID</TabsTrigger>
          </TabsList>

          <TabsContent value="my-orders" className="space-y-6">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Order Details</h2>
                  <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                    Back to Orders
                  </Button>
                </div>
                {/* Order details and map */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Order Details */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Order #{selectedOrder.id}</CardTitle>
                          <Badge className={getStatusColor(selectedOrder.status)}>
                            <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <CardDescription>{getStatusMessage(selectedOrder.status)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* ... keep existing code (order details content) */}
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                            <div className="flex items-start space-x-1">
                              <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                              <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <p className="text-sm font-medium">{selectedOrder.estimatedTime}</p>
                            </div>
                            {routeInfo && (
                              <p className="text-xs text-gray-500 mt-1">
                                Distance: {routeInfo.distance} km
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-600">Items Ordered</p>
                            <div className="flex items-start space-x-1">
                              <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                              <p className="text-sm">{selectedOrder.items.join(', ')}</p>
                            </div>
                          </div>
                          
                          <div className="pt-4 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Total Amount</span>
                              <span className="font-bold text-lg">${selectedOrder.totalAmount}</span>
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
                            <p className="font-medium">{selectedOrder.deliveryPartner}</p>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{selectedOrder.deliveryPartnerPhone}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </Button>
                        </div>
                        
                        {selectedOrder.currentLocation && (
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
                        <span>Live Delivery Tracking</span>
                      </CardTitle>
                      <CardDescription>
                        {selectedOrder.currentLocation 
                          ? 'Follow your delivery partner in real-time with route' 
                          : 'Waiting for location updates...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-96 relative">
                        {selectedOrder.currentLocation ? (
                          <DeliveryMap 
                            pickupLocation={selectedOrder.pickupLocation}
                            dropoffLocation={selectedOrder.deliveryLocation}
                            currentLocation={selectedOrder.currentLocation}
                            deliveryPartnerName={selectedOrder.deliveryPartner}
                            showDirections={true}
                            onRouteCalculated={handleRouteCalculated}
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
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>
                      Click on any order to view details and track delivery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {customerOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold">Order #{order.id}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  <span className="capitalize">{order.status.replace('_', ' ')}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {order.items.join(', ')}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{formatDate(order.createdAt)}</span>
                                <span className="font-medium">${order.totalAmount}</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="track-by-id" className="space-y-6">
            {/* Track by ID */}
            <Card>
              <CardHeader>
                <CardTitle>Track Order by ID</CardTitle>
                <CardDescription>
                  Enter any order ID to track delivery status
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
                  <Button onClick={trackOrderById} disabled={isLoading}>
                    <Search className="h-4 w-4 mr-2" />
                    {isLoading ? 'Tracking...' : 'Track Order'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Try tracking ID: ORD002 or ORD005
                </p>
              </CardContent>
            </Card>

            {selectedOrder && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Order Details */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Order #{selectedOrder.id}</CardTitle>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                          <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <CardDescription>{getStatusMessage(selectedOrder.status)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* ... keep existing code (order details content) */}
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Delivery Address</p>
                          <div className="flex items-start space-x-1">
                            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                            <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600">Estimated Delivery</p>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <p className="text-sm font-medium">{selectedOrder.estimatedTime}</p>
                          </div>
                          {routeInfo && (
                            <p className="text-xs text-gray-500 mt-1">
                              Distance: {routeInfo.distance} km
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600">Items Ordered</p>
                          <div className="flex items-start space-x-1">
                            <Package className="h-4 w-4 text-blue-500 mt-0.5" />
                            <p className="text-sm">{selectedOrder.items.join(', ')}</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Amount</span>
                            <span className="font-bold text-lg">${selectedOrder.totalAmount}</span>
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
                          <p className="font-medium">{selectedOrder.deliveryPartner}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{selectedOrder.deliveryPartnerPhone}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                      </div>
                      
                      {selectedOrder.currentLocation && (
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
                      <span>Live Delivery Tracking</span>
                    </CardTitle>
                    <CardDescription>
                      {selectedOrder.currentLocation 
                        ? 'Follow your delivery partner in real-time with route' 
                        : 'Waiting for location updates...'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-96 relative">
                      {selectedOrder.currentLocation ? (
                        <DeliveryMap 
                          pickupLocation={selectedOrder.pickupLocation}
                          dropoffLocation={selectedOrder.deliveryLocation}
                          currentLocation={selectedOrder.currentLocation}
                          deliveryPartnerName={selectedOrder.deliveryPartner}
                          showDirections={true}
                          onRouteCalculated={handleRouteCalculated}
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

            {!selectedOrder && !isLoading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Track Any Order
                  </h3>
                  <p className="text-gray-600">
                    Enter an order ID above to see real-time delivery updates and track the delivery partner on the map.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerTracking;
